/**
 * The audited inventory of cookies and similar technologies, as found by the technical review
 * of 10 October 2026 (source code, installed packages and a real-browser run of every page),
 * updated on 17 October 2026 for the optional Google Ads measurement tag (lib/ads.ts).
 * Keep it in sync with the code: if a technology is added or removed, this list changes too.
 * The Google cookie names and durations come from Google's documentation; Google may change them.
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
    purpose: "Guardar tu elección sobre las categorías opcionales (analíticas y publicidad y medición).",
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
  {
    name: "Etiqueta de Google Ads (script gtag.js, ID AW-18517392159, desde googletagmanager.com)",
    provider: "Google",
    purpose:
      "Medir si nuestros anuncios en Google llevan a acciones en este sitio, como abrir un enlace de Telegram, y poder mejorarlos. Un clic no indica que te hayas suscrito, hablado con alguien ni recibido el PDF.",
    category: "Publicidad y medición (opcional). Script de un tercero.",
    duration: "El script no guarda datos por sí mismo; las cookies que establece se describen a continuación.",
    consent: "Sí. Solo se carga si aceptas «Publicidad y medición».",
  },
  {
    name: "_gcl_aw, _gcl_au (y otras cookies _gcl_* o _gac_* de Google Ads)",
    provider: "Google (cookies creadas por la etiqueta en este dominio)",
    purpose:
      "Guardar la información del clic en un anuncio de Google, si llegas desde uno, y atribuir las conversiones a ese anuncio.",
    category: "Publicidad y medición (opcional). Cookie.",
    duration: "Hasta 90 días, según la documentación de Google; Google puede cambiarlo.",
    consent:
      "Sí. Solo se establecen si aceptas «Publicidad y medición» y se eliminan de este dominio al retirar el consentimiento.",
  },
  {
    name: "Cookies de Google en otros dominios (por ejemplo, google.com o doubleclick.net)",
    provider: "Google (cookies de terceros)",
    purpose:
      "Medición de conversiones de Google Ads (no se usan para remarketing ni publicidad personalizada). Su existencia, nombre y duración los determina Google según tu navegador y tu configuración de anuncios.",
    category: "Publicidad y medición (opcional). Cookie de terceros.",
    duration: "La define Google; consulta su documentación.",
    consent: "Sí. Solo pueden establecerse si aceptas «Publicidad y medición».",
  },
]
