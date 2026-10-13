/**
 * The audited inventory of cookies and similar technologies, as found by the technical review
 * of 10 October 2026 (source code, installed packages and a real-browser run of every page).
 * Keep it in sync with the code: if a technology is added or removed, this list changes too.
 */
export type InventoryItem = {
  name: string
  provider: string
  purpose: string
  category: string
  duration: string
  consent: string
}

export const INVENTORY_LABELS = {
  name: "Nombre",
  provider: "Proveedor",
  purpose: "Finalidad",
  category: "Categoría",
  duration: "Duración",
  consent: "Necesidad de consentimiento",
} as const

export const COOKIE_INVENTORY: InventoryItem[] = [
  {
    name: "ruta_cookie_consent",
    provider: "Ruta Cripto Segura (propio)",
    purpose: "Guardar tu elección sobre las cookies analíticas.",
    category: "Necesaria. Almacenamiento local del navegador (localStorage).",
    duration: "Hasta 12 meses; después se vuelve a pedir tu elección.",
    consent: "No. Es necesaria para respetar tus preferencias.",
  },
  {
    name: "ruta_final_popup_seen",
    provider: "Ruta Cripto Segura (propio)",
    purpose:
      "Recordar que ya se mostró el aviso de invitación a la comunidad durante la visita, para no repetirlo.",
    category: "Funcional de interfaz. Almacenamiento de sesión (sessionStorage).",
    duration: "Solo la sesión: se elimina al cerrar la pestaña.",
    consent: "No. No contiene datos personales ni identificadores.",
  },
  {
    name: "ruta_telegram_launcher_seen",
    provider: "Ruta Cripto Segura (propio)",
    purpose: "Recordar que ya usaste el botón flotante de la comunidad durante la visita.",
    category: "Funcional de interfaz. Almacenamiento de sesión (sessionStorage).",
    duration: "Solo la sesión: se elimina al cerrar la pestaña.",
    consent: "No. No contiene datos personales ni identificadores.",
  },
  {
    name: "Vercel Web Analytics (script /_vercel/insights/script.js)",
    provider: "Vercel Inc.",
    purpose: "Medir de forma agregada las visitas y las páginas vistas del sitio.",
    category: "Analítica (opcional).",
    duration:
      "El sitio no establece cookies ni almacenamiento propio para esta herramienta; su funcionamiento interno depende del proveedor.",
    consent: "Sí. Solo se carga si aceptas las cookies analíticas.",
  },
]
