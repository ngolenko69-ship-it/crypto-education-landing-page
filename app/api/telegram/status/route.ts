import { loadConfig } from "@/lib/bot/config"
import { collectStatus } from "@/lib/bot/diagnostics"
import { createDeps } from "@/lib/bot/runtime"
import { secretsMatch } from "@/lib/bot/security"

// Read-only health check of the bot deployment: token valid? bot administrator of the channel?
// store reachable? guide uploaded? webhook set? Used before the webhook is switched on.
//
// Protected by the same secret as the webhook, sent in the X-Telegram-Bot-Api-Secret-Token header:
//   curl -H "X-Telegram-Bot-Api-Secret-Token: $TELEGRAM_WEBHOOK_SECRET" https://<site>/api/telegram/status

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

function reply(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  })
}

export async function GET(request: Request): Promise<Response> {
  const loaded = loadConfig()
  if (!loaded.ok) {
    console.error(JSON.stringify({ evt: "bot_not_configured", missing: loaded.missing, invalid: loaded.invalid }))
    return reply(503, { ok: false, configured: false })
  }
  if (!secretsMatch(request.headers.get("x-telegram-bot-api-secret-token"), loaded.config.webhookSecret)) {
    return reply(401, { ok: false })
  }

  const report = await collectStatus(createDeps(loaded.config))
  return reply(report.ok ? 200 : 503, report)
}
