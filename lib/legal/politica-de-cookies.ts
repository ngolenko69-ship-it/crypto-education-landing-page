import type { LegalDoc } from "./types"
import { EMAIL, PRIVACY_LINK, TG_MANAGER } from "./markup"

export const politicaDeCookies: LegalDoc = {
  title: "Política de Cookies",
  sections: [
    {
      id: "introduccion",
      title: "1. Introducción",
      blocks: [
        { type: "p", text: "Ruta Cripto Segura respeta la privacidad de sus visitantes." },
        {
          type: "p",
          text: "Esta política explica qué son las cookies, qué tecnologías similares pueden utilizarse y cómo los usuarios pueden gestionar sus preferencias.",
        },
      ],
    },
    {
      id: "que-son",
      title: "2. ¿Qué son las cookies?",
      blocks: [
        {
          type: "p",
          text: "Las cookies son pequeños archivos o identificadores que determinados sitios web almacenan en el navegador o dispositivo del usuario.",
        },
        {
          type: "p",
          text: "También existen tecnologías similares, como el almacenamiento local, utilizadas para determinadas funcionalidades y preferencias.",
        },
      ],
    },
    {
      id: "tipos",
      title: "3. Tipos de cookies",
      blocks: [
        { type: "h3", text: "Cookies necesarias" },
        {
          type: "p",
          text: "Permiten el funcionamiento técnico, la seguridad y la prestación de funciones esenciales del sitio.",
        },
        { type: "h3", text: "Cookies analíticas" },
        {
          type: "p",
          text: "Pueden utilizarse para comprender el rendimiento del sitio y mejorar la experiencia de navegación.",
        },
        { type: "h3", text: "Cookies de marketing" },
        {
          type: "p",
          text: "Pueden utilizarse para medir campañas publicitarias, atribuir conversiones o personalizar publicidad.",
        },
        { type: "h3", text: "Cookies de terceros" },
        {
          type: "p",
          text: "Pueden proceder de herramientas o servicios externos incorporados al sitio.",
        },
      ],
    },
    {
      id: "tecnologias-utilizadas",
      title: "4. Cookies y tecnologías utilizadas",
      blocks: [
        {
          type: "p",
          text: "Ruta Cripto Segura documentará las cookies y tecnologías efectivamente empleadas en su sitio web.",
        },
        {
          type: "p",
          text: "Para cada elemento identificado, cuando corresponda, se informará:",
        },
        {
          type: "ul",
          items: [
            "Nombre.",
            "Proveedor.",
            "Finalidad.",
            "Categoría.",
            "Duración.",
            "Necesidad de consentimiento.",
          ],
        },
        // REPLACES the brief's "[COMPLETAR CON LOS RESULTADOS REALES DE LA AUDITORÍA TÉCNICA]":
        // the real results of the audit of 10 October 2026.
        { type: "h3", text: "Inventario de tecnologías" },
        { type: "cookie-inventory" },
        {
          type: "p",
          text: "Resultado de la revisión técnica del sitio realizada el 10 de octubre de 2026:",
        },
        {
          type: "ul",
          items: [
            "No se detectaron cookies HTTP, ni propias ni de terceros.",
            "No se utilizan Google Analytics, Google Tag Manager, Google Ads, Meta Pixel ni otras herramientas de publicidad o seguimiento.",
            "El sitio no incorpora widgets, vídeos ni otro contenido incrustado de terceros, y sus tipografías se sirven desde el propio sitio.",
            "El sitio no almacena nada más en tu navegador que las tecnologías de la lista anterior.",
          ],
        },
        {
          type: "p",
          text: "La presencia de enlaces a servicios externos no significa necesariamente que dichos servicios instalen cookies en nuestro dominio.",
        },
      ],
    },
    {
      id: "consentimiento",
      title: "5. Consentimiento",
      blocks: [
        {
          type: "p",
          text: "Cuando se utilicen cookies o tecnologías opcionales sujetas a consentimiento previo, el usuario tendrá la posibilidad de aceptarlas, rechazarlas o configurar sus preferencias.",
        },
        {
          type: "p",
          text: "No se activarán las tecnologías que requieran consentimiento antes de obtenerlo.",
        },
        {
          type: "p",
          text: "El usuario podrá modificar o retirar posteriormente el consentimiento cuando corresponda.",
        },
        // ADDED to match what the site really does (consent-gated Vercel Web Analytics).
        {
          type: "p",
          text: "En este sitio, Vercel Web Analytics es la única tecnología opcional. No se carga hasta que la aceptas, y puedes cambiar o retirar tu elección en cualquier momento:",
        },
        { type: "cookie-settings" },
      ],
    },
    {
      id: "gestion",
      title: "6. Gestión de cookies",
      blocks: [
        {
          type: "p",
          text: "Los usuarios pueden administrar determinadas cookies desde la configuración de su navegador.",
        },
        {
          type: "p",
          text: "La desactivación de tecnologías estrictamente necesarias puede afectar el funcionamiento de algunas características del sitio.",
        },
      ],
    },
    {
      id: "proveedores-externos",
      title: "7. Proveedores externos",
      blocks: [
        {
          type: "p",
          text: "Ruta Cripto Segura utiliza servicios tecnológicos para mantener su sitio y comunicarse con los usuarios.",
        },
        {
          type: "p",
          text: "Entre ellos pueden encontrarse Vercel, Google / Gmail y Telegram, según la finalidad del servicio.",
        },
        {
          type: "p",
          text: "El uso de estos proveedores no significa que todos instalen cookies en nuestro dominio.",
        },
      ],
    },
    {
      id: "proteccion-de-datos",
      title: "8. Protección de datos",
      blocks: [
        {
          type: "p",
          text: `Cuando el uso de cookies implique tratamiento de datos personales, se aplicará también nuestra ${PRIVACY_LINK}.`,
        },
      ],
    },
    {
      id: "actualizaciones",
      title: "9. Actualizaciones",
      blocks: [
        {
          type: "p",
          text: "Esta política podrá modificarse cuando cambien las tecnologías utilizadas o las obligaciones legales.",
        },
      ],
    },
    {
      id: "contacto",
      title: "10. Contacto",
      blocks: [
        {
          type: "facts",
          rows: [
            ["Email", EMAIL],
            ["Telegram", TG_MANAGER],
          ],
        },
      ],
    },
  ],
}
