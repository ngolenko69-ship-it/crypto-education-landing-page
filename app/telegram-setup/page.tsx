import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SITE_URL } from "@/lib/bot/links"
import { loadSetupConfig, SETUP_MESSAGES } from "@/lib/bot/setup"
import SetupConsole from "./setup-console"

// Temporary owner-only page that connects the Telegram bot once (see docs/TELEGRAM_BOT.md, section 7).
// It exists only while TELEGRAM_SETUP_ENABLED=true: otherwise this address is an ordinary 404. The
// switch is read on every request, never baked in at build time. The page itself holds no secret:
// the key is typed into the form and the checks run in the server route /api/telegram/setup.

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Подключение Telegram",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    googleBot: { index: false, follow: false, noarchive: true, nosnippet: true, noimageindex: true },
  },
  referrer: "no-referrer",
}

export default function TelegramSetupPage() {
  const setup = loadSetupConfig(process.env)
  if (setup.state === "disabled") notFound()

  return (
    <SetupConsole
      keyReady={setup.state === "ready"}
      notConfigured={SETUP_MESSAGES.notConfigured}
      expectedOrigin={process.env.VERCEL_ENV === "production" ? new URL(SITE_URL).origin : null}
    />
  )
}
