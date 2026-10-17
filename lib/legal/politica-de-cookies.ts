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
        { type: "h3", text: "Cookies de publicidad y medición" },
        {
          type: "p",
          text: "Pueden utilizarse para medir campañas publicitarias, atribuir conversiones o personalizar publicidad. En este sitio solo se utilizan si las aceptas (categoría «Publicidad y medición»).",
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
          text: "Resultado de la revisión técnica del sitio realizada el 10 de octubre de 2026 y actualizada el 17 de octubre de 2026, al incorporarse la etiqueta de medición de Google Ads:",
        },
        {
          type: "ul",
          items: [
            "Mientras no aceptes ninguna categoría opcional, el sitio no establece cookies HTTP, ni propias ni de terceros, y no carga ni Vercel Web Analytics ni la etiqueta de Google Ads.",
            "Si aceptas «Publicidad y medición», se carga la etiqueta de Google Ads (identificador AW-18517392159). Esa etiqueta puede establecer cookies de Google Ads en este dominio y enviar a Google datos de uso del sitio, como las páginas visitadas y las acciones realizadas, por ejemplo abrir un enlace de Telegram.",
            "No se utilizan Google Analytics, Google Tag Manager, Meta Pixel ni otras herramientas de publicidad o seguimiento distintas de las indicadas en el inventario.",
            "El sitio no incorpora widgets, vídeos ni otro contenido incrustado de terceros, y sus tipografías se sirven desde el propio sitio.",
            "El sitio no almacena nada más en tu navegador que las tecnologías de la lista anterior.",
          ],
        },
        {
          type: "p",
          text: "Aparte de la información técnica que la propia etiqueta de Google recibe de cada visita (página visitada, origen de la visita, dirección IP, tipo de navegador y de dispositivo), los únicos eventos que enviamos son los clics en nuestros enlaces a Telegram: curso gratuito, canal gratuito y administrador. Un clic no confirma que te hayas suscrito, que hayas hablado con alguien ni que hayas recibido el PDF: solo indica que se abrió el enlace. No enviamos tu nombre, tu correo electrónico ni datos de tu cuenta de Telegram.",
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
        // ADDED to match what the site really does: two independent optional categories, both
        // consent-gated (Vercel Web Analytics; the Google Ads tag with Consent Mode v2, basic).
        {
          type: "p",
          text: "En este sitio hay dos categorías opcionales, independientes entre sí: «Analíticas» (Vercel Web Analytics) y «Publicidad y medición» (etiqueta de Google Ads). Ninguna se carga hasta que la aceptas, y rechazarlas no limita el uso del sitio ni de ninguno de sus botones.",
        },
        {
          type: "p",
          text: "Aceptar «Analíticas» no activa «Publicidad y medición». Si ya habías aceptado las analíticas antes de que existiera la categoría de publicidad, tu elección se mantiene para las analíticas y «Publicidad y medición» permanece desactivada hasta que la aceptes.",
        },
        { type: "h3", text: "Google Consent Mode v2" },
        {
          type: "p",
          text: "Cuando aceptas «Publicidad y medición», informamos a Google de tu elección mediante las señales de consentimiento ad_storage, ad_user_data, ad_personalization y analytics_storage (Google Consent Mode v2). Las tres primeras reflejan tu decisión sobre «Publicidad y medición»; analytics_storage refleja la de «Analíticas». Antes de aceptar, la etiqueta de Google no se carga y no se envía nada a Google.",
        },
        {
          type: "p",
          text: "Si retiras el consentimiento, dejamos de enviar mediciones a Google de inmediato, actualizamos esas señales a «denegado» y eliminamos las cookies de Google Ads de este dominio; la etiqueta no vuelve a cargarse en tus siguientes visitas. Las cookies de terceros que Google haya podido establecer en otros dominios puedes borrarlas desde la configuración de tu navegador.",
        },
        {
          type: "p",
          text: "Guardamos tu elección durante 12 meses; después te la volvemos a preguntar. Puedes cambiarla o retirarla en cualquier momento:",
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
        {
          type: "p",
          text: "También puedes gestionar la personalización de anuncios de Google en [Configuración de anuncios de Google](https://adssettings.google.com) y consultar cómo utiliza Google la información de los sitios que usan sus servicios en [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).",
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
          text: "Entre ellos pueden encontrarse Vercel (alojamiento y, si lo aceptas, Vercel Web Analytics), Google (Gmail y, si aceptas «Publicidad y medición», la etiqueta de Google Ads) y Telegram, según la finalidad del servicio.",
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
