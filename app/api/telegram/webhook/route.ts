import { loadConfig } from "@/lib/bot/config"
import { describeError } from "@/lib/bot/log"
import { processUpdate } from "@/lib/bot/process-update"
import { createDeps } from "@/lib/bot/runtime"
import { secretsMatch } from "@/lib/bot/security"
import type { TgUpdate } from "@/lib/bot/types"

// Telegram webhook of the free-guide bot (@RutaCriptoSeguraBot). Server only: the bot token and the
// webhook secret live in environment variables and are never sent to the browser.
//
// POST  Telegram delivers an update. Accepted only with the secret in X-Telegram-Bot-Api-Secret-Token.
// Anything else (GET, ...) gets Next.js's default 405.

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

const MAX_BODY_CHARS = 256 * 1024

function reply(status: number, ok: boolean): Response {
  return new Response(JSON.stringify({ ok }), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  })
}

/** What kind of update this was, for the log. Never includes who sent it or what it said. */
function updateKind(update: TgUpdate): string {
  if (update.callback_query) return "button"
  if (update.message?.document) return "document"
  if (update.message) return "message"
  return "other"
}

export async function POST(request: Request): Promise<Response> {
  const loaded = loadConfig()
  if (!loaded.ok) {
    // Names only, never values. Visible in the Vercel runtime logs so the owner can see what is missing.
    console.error(JSON.stringify({ evt: "bot_not_configured", missing: loaded.missing, invalid: loaded.invalid }))
    return reply(503, false)
  }
  const { config } = loaded

  if (!secretsMatch(request.headers.get("x-telegram-bot-api-secret-token"), config.webhookSecret)) {
    return reply(401, false)
  }

  const raw = await request.text()
  if (raw.length > MAX_BODY_CHARS) return reply(413, false)

  let update: TgUpdate
  try {
    update = JSON.parse(raw) as TgUpdate
  } catch {
    return reply(400, false)
  }
  if (!update || typeof update.update_id !== "number") return reply(400, false)

  const deps = createDeps(config)
  const startedAt = Date.now()
  try {
    const outcome = await processUpdate(update, deps)
    deps.log.info("update", { id: update.update_id, kind: updateKind(update), outcome, ms: Date.now() - startedAt })
    // 5xx makes Telegram deliver the same update again; used only when nothing visible happened yet.
    return outcome === "retry" ? reply(500, false) : reply(200, true)
  } catch (error) {
    deps.log.error("webhook_failed", describeError(error))
    return reply(500, false)
  }
}
