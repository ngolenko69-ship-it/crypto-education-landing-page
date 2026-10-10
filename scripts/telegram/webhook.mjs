#!/usr/bin/env node
// Управление Telegram-ботом @RutaCriptoSeguraBot с вашего компьютера: webhook и список команд.
//
// Токен и секрет читаются ТОЛЬКО из переменных окружения вашего терминала (или из локального
// файла .env.local, который не попадает в Git). Скрипт никогда не печатает токен.
//
//   node --env-file=.env.local scripts/telegram/webhook.mjs <команда> [аргументы]
//
// Команды:
//   me                      проверить токен (покажет имя бота)
//   check <адрес-сайта>     проверить развёртывание: /api/telegram/status (токен, канал, хранилище)
//   set <адрес-webhook>     включить webhook (сначала сам запускает check; без --force не продолжит при ошибке)
//   info                    показать, что Telegram знает о webhook (ошибки доставки, очередь)
//   commands                задать меню команд бота (/start /guia /ayuda /canal)
//   delete [--drop-pending] выключить webhook
//
// Примеры:
//   node --env-file=.env.local scripts/telegram/webhook.mjs check https://crypto-education-landing-page.vercel.app
//   node --env-file=.env.local scripts/telegram/webhook.mjs set https://crypto-education-landing-page.vercel.app/api/telegram/webhook

const API = "https://api.telegram.org"
const WEBHOOK_PATH = "/api/telegram/webhook"
const ALLOWED_UPDATES = ["message", "callback_query"]
const COMMANDS = [
  { command: "start", description: "Iniciar el bot" },
  { command: "guia", description: "Obtener la guía gratuita" },
  { command: "ayuda", description: "Ayuda y contacto" },
  { command: "canal", description: "Abrir el canal oficial gratuito" },
]

const [command, ...args] = process.argv.slice(2)
const flags = new Set(args.filter((arg) => arg.startsWith("--")))
const positional = args.filter((arg) => !arg.startsWith("--"))

const token = (process.env.TELEGRAM_BOT_TOKEN ?? "").trim()
const secret = (process.env.TELEGRAM_WEBHOOK_SECRET ?? "").trim()

function fail(message) {
  console.error(`✖ ${message}`)
  process.exit(1)
}

function requireToken() {
  if (!token) fail("Не задана переменная TELEGRAM_BOT_TOKEN. Добавьте её в .env.local (файл в Git не попадает).")
}

function requireSecret() {
  if (!secret) fail("Не задана переменная TELEGRAM_WEBHOOK_SECRET. Добавьте её в .env.local.")
  if (!/^[A-Za-z0-9_-]{16,256}$/.test(secret)) fail("TELEGRAM_WEBHOOK_SECRET должен состоять из 16–256 символов A-Z a-z 0-9 _ - (например, результат `openssl rand -hex 32`).")
}

// Ошибка fetch может содержать адрес запроса, а в адресе — токен, поэтому оригинал не показываем.
async function telegram(method, params = {}) {
  let response
  try {
    response = await fetch(`${API}/bot${token}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(15000),
    })
  } catch {
    fail(`Не удалось связаться с Telegram (${method}). Проверьте интернет и повторите.`)
  }
  const body = await response.json().catch(() => null)
  if (!body?.ok) fail(`Telegram отклонил ${method}: ${body?.description ?? `HTTP ${response.status}`}`)
  return body.result
}

function parseSite(value, { expectWebhook }) {
  if (!value) fail(expectWebhook ? "Укажите полный адрес webhook, например https://ваш-сайт/api/telegram/webhook" : "Укажите адрес сайта, например https://crypto-education-landing-page.vercel.app")
  let url
  try {
    url = new URL(value)
  } catch {
    fail(`«${value}» не похоже на адрес.`)
  }
  if (url.protocol !== "https:") fail("Telegram принимает webhook только по HTTPS.")
  if (/^(localhost|127\.|10\.|192\.168\.)/.test(url.hostname)) fail("Адрес должен быть публичным (не localhost).")
  if (expectWebhook && url.pathname !== WEBHOOK_PATH) fail(`Адрес должен заканчиваться на ${WEBHOOK_PATH}`)
  return url
}

async function check(origin) {
  requireSecret()
  let response
  try {
    response = await fetch(`${origin}/api/telegram/status`, { headers: { "x-telegram-bot-api-secret-token": secret }, signal: AbortSignal.timeout(30000) })
  } catch {
    return { ok: false, reason: "сайт не отвечает" }
  }
  if (response.status === 401) return { ok: false, reason: "секрет не совпадает: TELEGRAM_WEBHOOK_SECRET на сервере (Vercel) отличается от вашего локального" }
  if (response.status === 404) return { ok: false, reason: "на сайте ещё нет /api/telegram/status — не задеплоена ветка с ботом (нужен merge в main для боевого адреса)" }
  const report = await response.json().catch(() => null)
  if (!report) return { ok: false, reason: `неожиданный ответ сервера (HTTP ${response.status})` }
  if (report.configured === false) return { ok: false, reason: "на сервере не заданы переменные окружения бота (см. Vercel → Settings → Environment Variables)" }
  return { ok: response.status === 200 && report.ok === true, report }
}

function printReport(report) {
  const mark = (value) => (value ? "✅" : "❌")
  console.log(`  ${mark(report.bot?.ok)} токен бота: ${report.bot?.ok ? `@${report.bot.username}` : `ошибка (${report.bot?.error ?? "?"})`}`)
  console.log(`  ${mark(report.channel?.ok)} канал ${report.channel?.chat}: ${report.channel?.botStatus ? `бот — ${report.channel.botStatus}` : `ошибка (${report.channel?.error ?? "?"})`}${report.channel?.ok ? "" : " (бот должен быть администратором канала)"}`)
  console.log(`  ${mark(report.store?.ok)} хранилище Redis (${report.store?.kind}): ${report.store?.ok ? "доступно" : "нет связи"}`)
  console.log(`  ${report.guide?.configured ? "✅" : "⚠️ "} PDF-гайд: ${report.guide?.configured ? `загружен (${report.guide.fileName ?? "файл"})` : "ещё не загружен (это нормально до первой загрузки)"}`)
  console.log(`  ${report.admins > 0 ? "✅" : "⚠️ "} администраторов в TELEGRAM_ADMIN_USER_IDS: ${report.admins}`)
  console.log(`  ℹ️  webhook сейчас: ${report.webhook?.url ?? "не установлен"}`)
  for (const warning of report.warnings ?? []) console.log(`  ⚠️  ${warning}`)
}

async function main() {
  switch (command) {
    case "me": {
      requireToken()
      const me = await telegram("getMe")
      console.log(`✅ Токен рабочий. Бот: @${me.username} (id ${me.id}), «${me.first_name}»`)
      return
    }

    case "check": {
      const site = parseSite(positional[0], { expectWebhook: false })
      console.log(`Проверяю развёртывание ${site.origin} …`)
      const result = await check(site.origin)
      if (result.report) printReport(result.report)
      if (!result.ok) fail(result.reason ?? "развёртывание не готово (см. ❌ выше)")
      console.log("\n✅ Развёртывание готово. Можно включать webhook командой set.")
      return
    }

    case "set": {
      requireToken()
      requireSecret()
      const url = parseSite(positional[0], { expectWebhook: true })
      console.log(`Проверяю развёртывание ${url.origin} перед включением webhook …`)
      const result = await check(url.origin)
      if (result.report) printReport(result.report)
      if (!result.ok) {
        if (!flags.has("--force")) fail(`Webhook НЕ включён: ${result.reason ?? "развёртывание не готово (см. ❌ выше)"}. Исправьте и повторите (или --force, если уверены).`)
        console.log("⚠️  --force: включаю webhook несмотря на ошибки проверки.")
      }
      await telegram("setWebhook", {
        url: url.href,
        secret_token: secret,
        allowed_updates: ALLOWED_UPDATES,
        max_connections: 10,
        drop_pending_updates: flags.has("--drop-pending"),
      })
      const info = await telegram("getWebhookInfo")
      console.log(`\n✅ Webhook включён: ${info.url}`)
      console.log(`   ожидающих обновлений: ${info.pending_update_count}; типы обновлений: ${(info.allowed_updates ?? []).join(", ")}`)
      console.log("   Дальше: отправьте боту PDF с подписью /subir_guia (см. docs/TELEGRAM_BOT.md, шаг «Загрузка PDF»).")
      return
    }

    case "info": {
      requireToken()
      const info = await telegram("getWebhookInfo")
      console.log(`webhook: ${info.url || "не установлен"}`)
      console.log(`ожидающих обновлений: ${info.pending_update_count}`)
      console.log(`типы обновлений: ${(info.allowed_updates ?? []).join(", ") || "по умолчанию"}`)
      if (info.last_error_message) console.log(`⚠️  последняя ошибка доставки (${new Date(info.last_error_date * 1000).toISOString()}): ${info.last_error_message}`)
      else console.log("ошибок доставки нет")
      return
    }

    case "commands": {
      requireToken()
      await telegram("setMyCommands", { commands: COMMANDS })
      const set = await telegram("getMyCommands")
      console.log("✅ Меню команд задано:")
      for (const item of set) console.log(`   /${item.command} — ${item.description}`)
      return
    }

    case "delete": {
      requireToken()
      await telegram("deleteWebhook", { drop_pending_updates: flags.has("--drop-pending") })
      console.log("✅ Webhook выключен. Бот перестал отвечать, пока вы снова не выполните set.")
      return
    }

    default:
      console.log("Команды: me | check <сайт> | set <адрес-webhook> | info | commands | delete\nПодробности — в начале файла scripts/telegram/webhook.mjs и в docs/TELEGRAM_BOT.md")
      process.exit(command ? 1 : 0)
  }
}

await main()
