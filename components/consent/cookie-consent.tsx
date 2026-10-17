"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { OPEN_SETTINGS_EVENT, getConsentSnapshot, saveConsent, type ConsentChoice } from "@/lib/consent"
import { useConsent } from "./use-consent"

// Accept and reject share exactly the same look and size: rejecting is as easy as accepting.
const choiceButton = "cta-base cta-secondary min-h-11 cursor-pointer px-2 text-sm sm:px-4"

const ACCEPT_ALL: ConsentChoice = { analytics: true, advertising: true }
const REJECT_ALL: ConsentChoice = { analytics: false, advertising: false }

/** A switch card for one optional category: the whole card is the checkbox, so the target is large. */
function ConsentToggle({
  id,
  title,
  description,
  checked,
  onChange,
}: {
  id: string
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <li className="relative rounded-xl border border-[var(--line-gold)] bg-surface-deep/60 p-4 pr-[5.25rem]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-labelledby={id}
        aria-describedby={`${id}-texto`}
        className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-4 block h-7 w-12 rounded-full border border-gold/40 bg-surface-deep transition-colors peer-checked:bg-gold/35 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--gold-text)] after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-text-secondary after:transition-transform peer-checked:after:translate-x-5 peer-checked:after:bg-gold-text"
      />
      <h3 id={id} className="text-[15px] font-semibold text-text-primary">
        {title}
      </h3>
      <p id={`${id}-texto`} className="mt-1 text-sm leading-snug text-text-secondary">
        {description}
      </p>
    </li>
  )
}

/**
 * Consent banner + preferences dialog for the optional technologies, in three categories:
 * necessary (always on), "Analíticas" (Vercel Web Analytics) and "Publicidad y medición" (the
 * Google Ads tag). The two optional ones are independent choices. Nothing optional loads until
 * the visitor accepts it; "not decided" behaves like "rejected". The banner never takes focus and
 * does not block the page, so the cookie policy can be read before deciding. The preferences
 * dialog is a native modal <dialog>: focus trap, Escape and focus return come from the browser.
 */
export function CookieConsent() {
  const consent = useConsent()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [draft, setDraft] = useState<ConsentChoice>(REJECT_ALL)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const openSettings = () => {
    const { analytics, advertising } = getConsentSnapshot()
    setDraft({ analytics, advertising })
    setSettingsOpen(true)
  }

  // The footer and the cookie policy open the same dialog through a window event.
  useEffect(() => {
    const onOpen = () => {
      const { analytics, advertising } = getConsentSnapshot()
      setDraft({ analytics, advertising })
      setSettingsOpen(true)
    }
    window.addEventListener(OPEN_SETTINGS_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, onOpen)
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (settingsOpen && !dialog.open) dialog.showModal()
    else if (!settingsOpen && dialog.open) dialog.close()
  }, [settingsOpen])

  const showBanner = consent.ready && !consent.decided

  return (
    <>
      {showBanner && (
        <section
          role="region"
          aria-labelledby="cc-titulo"
          aria-describedby="cc-texto"
          className="fixed inset-x-3 z-[70] rounded-[18px] border border-[var(--line-gold)] bg-surface p-4 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.75)] sm:inset-x-auto sm:left-6 sm:w-[min(34rem,calc(100vw-3rem))] sm:p-6"
          style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
        >
          {/* Phones (below 640px) get the compact version: smaller title, the same facts in fewer
              words with the policy link inline, and the three choices in one row from 360px (two rows
              on narrower screens). From 640px everything is as before. */}
          <h2 id="cc-titulo" className="font-serif text-base font-medium leading-snug text-text-primary sm:text-[1.15rem]">
            Tu privacidad es importante
          </h2>
          <p id="cc-texto" className="mt-1.5 text-[13px] leading-snug text-text-secondary sm:mt-2 sm:text-sm sm:leading-relaxed">
            <span className="sm:hidden">
              Usamos tecnologías necesarias para que el sitio funcione. Las de análisis y de publicidad
              solo se activan si las aceptas.{" "}
              <Link
                href="/politica-de-cookies"
                className="font-medium text-gold-text underline decoration-gold/40 underline-offset-4 transition-colors hover:text-gold"
              >
                Política de Cookies
              </Link>
            </span>
            <span className="hidden sm:inline">
              Utilizamos tecnologías necesarias para el funcionamiento del sitio. Con tu consentimiento,
              también podremos utilizar herramientas opcionales de análisis y de publicidad y medición.
              Puedes aceptar, rechazar o configurar tus preferencias.
            </span>
          </p>
          <p className="mt-2 hidden text-sm sm:block">
            <Link
              href="/politica-de-cookies"
              className="font-medium text-gold-text underline decoration-gold/40 underline-offset-4 transition-colors hover:text-gold"
            >
              Política de Cookies
            </Link>
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 min-[360px]:grid-cols-3 sm:mt-4 sm:grid-cols-2">
            <button type="button" onClick={() => saveConsent(ACCEPT_ALL)} className={choiceButton}>
              Aceptar
            </button>
            <button type="button" onClick={() => saveConsent(REJECT_ALL)} className={choiceButton}>
              Rechazar
            </button>
            <button
              type="button"
              onClick={openSettings}
              className="col-span-2 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full px-2 text-sm font-medium text-text-primary underline decoration-gold/50 underline-offset-4 transition-colors hover:text-gold-text min-[360px]:col-span-1 sm:col-span-2 sm:px-4"
            >
              Configurar
            </button>
          </div>
        </section>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby="cs-titulo"
        aria-describedby="cs-texto"
        onClose={() => setSettingsOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSettingsOpen(false)
        }}
        onKeyDown={(e) => {
          if (e.key !== "Tab") return
          const items = Array.from(
            e.currentTarget.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled])"),
          )
          if (items.length === 0) return
          const first = items[0]
          const last = items[items.length - 1]
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last.focus()
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }}
        className="m-auto max-h-[calc(100dvh-2rem)] rounded-[18px] border border-[var(--line-gold)] bg-surface w-[min(32rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain p-0 text-left text-text-primary shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)] backdrop:bg-[rgba(3,9,7,0.72)] backdrop:backdrop-blur-sm"
      >
        <div className="p-6 sm:p-7">
          <h2 id="cs-titulo" className="font-serif text-[1.35rem] font-medium leading-snug text-text-primary">
            Preferencias de cookies
          </h2>
          <p id="cs-texto" className="mt-2 text-sm leading-relaxed text-text-secondary">
            Elige qué tecnologías opcionales permites. Las necesarias siempre están activas.
          </p>

          <ul role="list" className="mt-5 space-y-3">
            <li className="rounded-xl border border-[var(--line-gold)] bg-surface-deep/60 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div>
                  <h3 className="text-[15px] font-semibold text-text-primary">Necesarias</h3>
                  <p className="mt-1 text-sm leading-snug text-text-secondary">
                    Permiten el funcionamiento del sitio y recuerdan tus preferencias.
                  </p>
                </div>
                <span className="shrink-0 pt-0.5 text-xs font-semibold uppercase tracking-wider text-gold-text">
                  Siempre activas
                </span>
              </div>
            </li>
            <ConsentToggle
              id="cs-analiticas"
              title="Analíticas"
              description="Vercel Web Analytics: estadísticas agregadas de visitas. Solo se cargan si las activas."
              checked={draft.analytics}
              onChange={(analytics) => setDraft((d) => ({ ...d, analytics }))}
            />
            <ConsentToggle
              id="cs-publicidad"
              title="Publicidad y medición"
              description="Etiqueta de Google Ads: mide si nuestros anuncios llevan a acciones en este sitio (por ejemplo, abrir Telegram) y ayuda a mejorarlos. Google puede usar cookies y recibir datos de uso. Solo se carga si la activas."
              checked={draft.advertising}
              onChange={(advertising) => setDraft((d) => ({ ...d, advertising }))}
            />
          </ul>

          <p className="mt-4 text-sm">
            <Link
              href="/politica-de-cookies"
              onClick={() => setSettingsOpen(false)}
              className="font-medium text-gold-text underline decoration-gold/40 underline-offset-4 transition-colors hover:text-gold"
            >
              Política de Cookies
            </Link>
          </p>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                saveConsent(draft)
                setSettingsOpen(false)
              }}
              className="cta-base cta-primary min-h-11 flex-1 cursor-pointer px-4 text-sm"
            >
              Guardar preferencias
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="cta-base cta-secondary min-h-11 flex-1 cursor-pointer px-4 text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
