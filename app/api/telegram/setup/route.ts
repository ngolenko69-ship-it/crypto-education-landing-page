import { loadConfig } from "@/lib/bot/config"
import { SITE_URL } from "@/lib/bot/links"
import { createLogger, describeError } from "@/lib/bot/log"
import { createDeps, createStore } from "@/lib/bot/runtime"
import { checkSetup, connectTelegram, knownSecrets, loadSetupConfig, reportWithoutConfig, SETUP_MESSAGES } from "@/lib/bot/setup"
import { authorizeSetup, SETUP_FAIL_WINDOW_SECONDS, visitorAddress } from "@/lib/bot/setup-auth"
import type { SetupAction, SetupErrorCode, SetupReport, SetupResponse, SetupStep } from "@/lib/bot/setup-types"

// One-time browser setup of the bot: the page /telegram-setup posts here to check the deployment and
// to connect Telegram (command menu + webhook). Server only: every Telegram call happens here.
//
// - Does not exist unless TELEGRAM_SETUP_ENABLED=true: every method answers 404 while it is off.
// - POST only, JSON body {action, key}. The key never travels in the address, and a query string is refused.
// - The webhook address is a constant in lib/bot/setup.ts; nothing in the request can change it.
// - Wrong keys are rate limited (lib/bot/setup-auth.ts); nothing secret is logged or returned.

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

const MAX_BODY_CHARS = 2048

const HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store, max-age=0",
  "x-robots-tag": "noindex, nofollow, noarchive",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
}

/** The response of a route that is switched off: the same as for an address that does not exist. */
function unavailable(): Response {
  return new Response("Not Found", { status: 404, headers: { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } })
}

function reply(status: number, body: SetupResponse, secrets: readonly string[], extra: Record<string, string> = {}): Response {
  // The body is built from fixed texts only; this last pass makes sure a known secret could not slip through anyway.
  const text = secrets.flatMap((secret) => [secret, JSON.stringify(secret).slice(1, -1)]).reduce((acc, secret) => (secret ? acc.split(secret).join("[скрыто]") : acc), JSON.stringify(body))
  return new Response(text, { status, headers: { ...HEADERS, ...extra } })
}

function parseCommand(raw: string): { action: SetupAction; key: string } | null {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof data !== "object" || data === null) return null
  const { action, key } = data as { action?: unknown; key?: unknown }
  if (action !== "check" && action !== "connect") return null
  if (typeof key !== "string" || key.trim().length < 1 || key.length > 256) return null
  return { action, key: key.trim() }
}

/** In production the page and this route are used from the production address only. */
function crossSite(request: Request, env: Record<string, string | undefined>): boolean {
  if (env.VERCEL_ENV !== "production") return false
  const origin = request.headers.get("origin")
  if (origin && origin !== new URL(SITE_URL).origin) return true
  const site = request.headers.get("sec-fetch-site")
  return Boolean(site && site !== "same-origin")
}

export async function POST(request: Request): Promise<Response> {
  const env = process.env
  const setup = loadSetupConfig(env)
  if (setup.state === "disabled") return unavailable()

  const secrets = knownSecrets(env)
  const log = createLogger(secrets)
  const refuse = (status: number, error: SetupErrorCode, message: string, extra?: Record<string, string>) => reply(status, { ok: false, error, message }, secrets, extra)

  if (setup.state === "misconfigured") {
    log.warn("setup_not_configured")
    return refuse(503, "not_configured", SETUP_MESSAGES.notConfigured)
  }

  // The shape of the request first: cheap, and it never touches Redis or Telegram.
  if (new URL(request.url).search !== "") return refuse(400, "invalid_request", SETUP_MESSAGES.invalid)
  if (crossSite(request, env)) return refuse(403, "cross_site", SETUP_MESSAGES.crossSite)
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return refuse(400, "invalid_request", SETUP_MESSAGES.invalid)
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_CHARS) return refuse(413, "invalid_request", SETUP_MESSAGES.invalid)
  const raw = await request.text()
  if (raw.length > MAX_BODY_CHARS) return refuse(413, "invalid_request", SETUP_MESSAGES.invalid)
  const command = parseCommand(raw)
  if (!command) return refuse(400, "invalid_request", SETUP_MESSAGES.invalid)

  const loaded = loadConfig(env)
  const auth = await authorizeSetup({
    provided: command.key,
    expected: setup.key,
    address: visitorAddress(request.headers),
    store: loaded.ok ? createStore(loaded.config) : null,
    log,
  })
  if (!auth.ok) {
    log.warn("setup_denied", { reason: auth.reason })
    return auth.reason === "rate_limited"
      ? refuse(429, "rate_limited", SETUP_MESSAGES.rateLimited, { "retry-after": String(SETUP_FAIL_WINDOW_SECONDS) })
      : refuse(401, "unauthorized", SETUP_MESSAGES.unauthorized)
  }

  try {
    const blocked = (report: SetupReport, steps?: SetupStep[]) => reply(409, { ok: false, error: "checks_failed", message: SETUP_MESSAGES.checksFailed, report, ...(steps ? { steps } : {}) }, secrets)

    if (!loaded.ok) {
      // The bot's own variables are incomplete: say which ones, by name, and do nothing else.
      const report = reportWithoutConfig(loaded)
      log.info("setup_check", { configured: false })
      return command.action === "check" ? reply(200, { ok: true, action: "check", report }, secrets) : blocked(report)
    }

    const deps = createDeps(loaded.config)
    if (command.action === "check") {
      const report = await checkSetup(deps)
      log.info("setup_check", { configured: true, canConnect: report.canConnect, connected: report.connected })
      return reply(200, { ok: true, action: "check", report }, secrets)
    }

    const result = await connectTelegram(deps)
    log.info("setup_connect", { result: result.status })
    if (result.status === "connected") return reply(200, { ok: true, action: "connect", report: result.report, steps: result.steps }, secrets)
    if (result.status === "blocked") return blocked(result.report)
    return reply(502, { ok: false, error: "telegram_error", message: result.message, report: result.report, steps: result.steps }, secrets)
  } catch (error) {
    log.error("setup_failed", describeError(error))
    return refuse(500, "server_error", SETUP_MESSAGES.serverError)
  }
}

// Any other method: gone while the switch is off, "use POST" while it is on. No CORS headers are ever
// sent, so another site cannot call this route from a browser.
function otherMethod(): Response {
  if (loadSetupConfig(process.env).state === "disabled") return unavailable()
  return new Response(JSON.stringify({ ok: false, error: "invalid_request", message: SETUP_MESSAGES.invalid }), { status: 405, headers: { ...HEADERS, allow: "POST" } })
}

export async function GET(): Promise<Response> {
  return otherMethod()
}
export async function HEAD(): Promise<Response> {
  return otherMethod()
}
export async function PUT(): Promise<Response> {
  return otherMethod()
}
export async function PATCH(): Promise<Response> {
  return otherMethod()
}
export async function DELETE(): Promise<Response> {
  return otherMethod()
}
export async function OPTIONS(): Promise<Response> {
  return otherMethod()
}
