"use client"

import { useState, useSyncExternalStore, type FormEvent } from "react"
import { SETUP_API_PATH, SETUP_BOT_CHAT_URL, type ItemState, type SetupAction, type SetupReport, type SetupResponse, type SetupStep } from "@/lib/bot/setup-types"
import styles from "./setup.module.css"

// The form of the one-time setup page. The key lives only in this component's memory: it is sent in
// the body of a POST to our own server route and is never written to storage, the address or the
// console. The server answers with fixed texts and variable names only, so there is nothing secret to show.

type Notice = { tone: "error" | "success"; text: string }

const MARK: Record<ItemState, string> = { ok: "✓", fail: "✕", warn: "!", info: "i", skipped: "–" }
const WORD: Record<ItemState, string> = { ok: "Успешно", fail: "Ошибка", warn: "Внимание", info: "К сведению", skipped: "Пропущено" }

// Facts about the browser window, read the React way (no state set inside an effect).
const subscribe = () => () => undefined
const readFramed = () => (window.top !== window.self ? "yes" : "no")
const readOrigin = () => window.location.origin

export default function SetupConsole({ keyReady, notConfigured, expectedOrigin }: { keyReady: boolean; notConfigured: string; expectedOrigin: string | null }) {
  const [key, setKey] = useState("")
  const [reveal, setReveal] = useState(false)
  const [busy, setBusy] = useState<SetupAction | null>(null)
  const [report, setReport] = useState<SetupReport | null>(null)
  const [steps, setSteps] = useState<SetupStep[]>([])
  const [notice, setNotice] = useState<Notice | null>(null)
  const [canConnect, setCanConnect] = useState(false)
  const [connected, setConnected] = useState(false)
  const [generated, setGenerated] = useState("")
  const [copied, setCopied] = useState(false)

  const framed = useSyncExternalStore(subscribe, readFramed, () => "no") === "yes"
  const origin = useSyncExternalStore(subscribe, readOrigin, () => "")
  const wrongAddress = expectedOrigin !== null && origin !== "" && origin !== expectedOrigin
  const locked = !keyReady || framed || wrongAddress
  const empty = key.trim() === ""

  async function run(action: SetupAction) {
    if (busy || locked || empty) return
    setBusy(action)
    setNotice(null)
    setConnected(false)
    try {
      const response = await fetch(SETUP_API_PATH, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, key }),
        cache: "no-store",
        credentials: "same-origin",
        referrerPolicy: "no-referrer",
      })
      const data = (await response.json().catch(() => null)) as SetupResponse | null

      if (response.status === 404) {
        setReport(null)
        setCanConnect(false)
        setNotice({ tone: "error", text: "Настройка сейчас выключена. Обновите страницу." })
        return
      }
      if (!data) {
        setCanConnect(false)
        setNotice({ tone: "error", text: "Сервер ответил неожиданно. Повторите через минуту." })
        return
      }
      if (!data.ok) {
        if (data.report) setReport(data.report)
        if (data.steps) setSteps(data.steps)
        setCanConnect(false)
        setNotice({ tone: "error", text: data.message })
        return
      }

      setReport(data.report)
      if (data.action === "check") {
        setSteps([])
        setCanConnect(data.report.canConnect)
        setNotice(
          data.report.canConnect
            ? { tone: "success", text: data.report.connected ? "Проверка пройдена: Telegram уже подключён. Можно открыть бота и нажать Start." : "Проверка пройдена. Теперь можно нажать «Подключить Telegram»." }
            : { tone: "error", text: "Есть ошибки — исправьте их по подсказкам ниже и проверьте ещё раз. Подключить Telegram пока нельзя." },
        )
        return
      }
      // Connected: the key is no longer needed in the form.
      setSteps(data.steps)
      setCanConnect(false)
      setConnected(true)
      setKey("")
      setReveal(false)
      setNotice({ tone: "success", text: "Готово: Telegram подключён." })
    } catch {
      setCanConnect(false)
      setNotice({ tone: "error", text: "Нет связи с сервером. Проверьте интернет и повторите." })
    } finally {
      setBusy(null)
    }
  }

  /** A random 43-character key made here in the browser. It is shown once and never sent anywhere or stored. */
  function generateKey() {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    setGenerated(btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", ""))
    setCopied(false)
  }

  async function copyGenerated() {
    try {
      await navigator.clipboard.writeText(generated)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void run("check")
  }

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <p className={styles.eyebrow}>Временная страница · только для владельца</p>
        <h1 className={styles.headline}>Подключение Telegram-бота</h1>
        <p className={styles.lead}>
          Один раз проверьте настройки и подключите @RutaCriptoSeguraBot к сайту. Всё выполняется на сервере: токены и секреты в браузер не попадают, а webhook включается только по нажатию кнопки ниже.
        </p>

        {!keyReady && (
          <p className={styles.warning} role="alert">
            {notConfigured}
          </p>
        )}
        {framed && (
          <p className={styles.warning} role="alert">
            Страница открыта внутри другой страницы, поэтому работа заблокирована. Откройте её напрямую в новой вкладке.
          </p>
        )}
        {wrongAddress && expectedOrigin && (
          <p className={styles.warning} role="alert">
            Откройте страницу по адресу {expectedOrigin}/telegram-setup — только там настройка работает.
          </p>
        )}

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <label className={styles.label} htmlFor="setup-key">
            Ключ настройки
          </label>
          <div className={styles.keyRow}>
            <input
              id="setup-key"
              className={styles.input}
              type={reveal ? "text" : "password"}
              value={key}
              onChange={(event) => {
                setKey(event.target.value)
                setCanConnect(false)
              }}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              disabled={locked || busy !== null}
              aria-describedby="setup-key-hint"
            />
            <button type="button" className={styles.reveal} onClick={() => setReveal((value) => !value)} aria-pressed={reveal} disabled={locked}>
              {reveal ? "Скрыть" : "Показать"}
            </button>
          </div>
          <p className={styles.hint} id="setup-key-hint">
            Это значение переменной TELEGRAM_SETUP_SECRET, которую вы добавили в Vercel. Оно вводится только здесь и нигде не сохраняется.
          </p>

          <div className={styles.actions}>
            <button type="submit" className={`${styles.button} ${styles.secondary}`} disabled={locked || busy !== null || empty} aria-busy={busy === "check"}>
              {busy === "check" ? "Проверяю…" : "Проверить подключение"}
            </button>
            <button type="button" className={`${styles.button} ${styles.primary}`} onClick={() => void run("connect")} disabled={locked || busy !== null || empty || !canConnect} aria-busy={busy === "connect"}>
              {busy === "connect" ? "Подключаю…" : "Подключить Telegram"}
            </button>
          </div>
          <p className={styles.hint}>Кнопка «Подключить Telegram» становится доступной после успешной проверки.</p>
        </form>

        <details className={styles.generator}>
          <summary className={styles.generatorSummary}>У меня ещё нет ключа — создать его в браузере</summary>
          <div className={styles.generatorBody}>
            <p className={styles.hint}>
              Ключ создаётся здесь, в вашем браузере: он никуда не отправляется и нигде не сохраняется. Скопируйте его и добавьте в Vercel как переменную TELEGRAM_SETUP_SECRET (окружение Production), затем сделайте Redeploy и вставьте тот же ключ в поле выше.
            </p>
            <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={generateKey}>
              Создать ключ
            </button>
            {generated && (
              <div className={styles.keyRow}>
                <input className={styles.input} readOnly value={generated} aria-label="Созданный ключ" onFocus={(event) => event.currentTarget.select()} spellCheck={false} />
                <button type="button" className={styles.reveal} onClick={() => void copyGenerated()}>
                  {copied ? "Скопировано" : "Копировать"}
                </button>
              </div>
            )}
          </div>
        </details>

        <div aria-live="polite">
          {notice && (
            <p className={notice.tone === "error" ? styles.errorNote : styles.successNote} role={notice.tone === "error" ? "alert" : "status"}>
              {notice.text}
            </p>
          )}
        </div>

        {connected && (
          <section className={styles.done} aria-labelledby="done-title">
            <h2 className={styles.doneTitle} id="done-title">
              Telegram подключён
            </h2>
            <ul className={styles.facts}>
              {steps.map((step) => (
                <li key={step.id}>
                  {step.ok ? "✓" : "✕"} {step.title}
                </li>
              ))}
            </ul>
            <ol className={styles.nextList}>
              <li>
                Откройте{" "}
                <a className={styles.link} href={SETUP_BOT_CHAT_URL} target="_blank" rel="noopener noreferrer">
                  @RutaCriptoSeguraBot
                </a>{" "}
                в Telegram и нажмите Start — должно прийти приветствие с кнопками.
              </li>
              <li>Ключ из формы очищен. Теперь выключите эту страницу: в Vercel удалите TELEGRAM_SETUP_ENABLED и TELEGRAM_SETUP_SECRET и сделайте Redeploy.</li>
            </ol>
          </section>
        )}

        {report && (
          <section className={styles.report} aria-labelledby="report-title">
            <h2 className={styles.reportTitle} id="report-title">
              Результат проверки
            </h2>
            <p className={styles.stamp}>Проверено в {new Date(report.checkedAt).toLocaleTimeString("ru-RU")}</p>
            <ul className={styles.items}>
              {report.items.map((entry) => (
                <li className={styles.entry} data-state={entry.state} key={entry.id}>
                  <span className={styles.mark} aria-hidden="true">
                    {MARK[entry.state]}
                  </span>
                  <div>
                    <p className={styles.entryTitle}>
                      <span className={styles.visuallyHidden}>{WORD[entry.state]}: </span>
                      {entry.title}
                    </p>
                    <p className={styles.entrySummary}>{entry.summary}</p>
                    {entry.details && entry.details.length > 0 && (
                      <ul className={styles.facts}>
                        {entry.details.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className={styles.footnote}>
          После настройки страницу нужно выключить: Vercel → Settings → Environment Variables → удалить TELEGRAM_SETUP_ENABLED и TELEGRAM_SETUP_SECRET → Redeploy. Адрес /telegram-setup после этого перестанет открываться.
        </p>
      </div>
    </main>
  )
}
