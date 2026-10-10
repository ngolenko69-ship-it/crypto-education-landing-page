import type { LegalDoc } from "./types"
import { EMAIL, OWNER, SITE, TG_ADMIN, TG_COMMUNITY } from "./markup"

export const avisoLegal: LegalDoc = {
  title: "Aviso Legal",
  sections: [
    {
      id: "informacion-general",
      title: "1. Información general",
      blocks: [
        {
          type: "p",
          text: "Ruta Cripto Segura es un proyecto educativo independiente dedicado a facilitar el aprendizaje sobre criptomonedas, activos digitales, tecnología blockchain, seguridad digital y prevención de fraudes.",
        },
        {
          type: "p",
          text: "Nuestra plataforma está dirigida principalmente a usuarios de Argentina, Perú y otras comunidades de habla hispana.",
        },
        {
          type: "facts",
          rows: [
            ["Nombre del proyecto", "Ruta Cripto Segura"],
            ["Actividad", "Educación e información sobre activos digitales y seguridad en el ecosistema cripto."],
            ["Correo electrónico", EMAIL],
            ["Contacto oficial de Telegram", TG_ADMIN],
            ["Comunidad educativa", TG_COMMUNITY],
            ["Sitio web", SITE],
            ["Responsable legal del sitio", OWNER],
          ],
        },
        {
          type: "p",
          text: "La identificación legal del responsable deberá completarse conforme a la legislación aplicable.",
        },
      ],
    },
    {
      id: "finalidad-educativa",
      title: "2. Finalidad educativa",
      blocks: [
        {
          type: "p",
          text: "El objetivo de Ruta Cripto Segura es proporcionar herramientas educativas que permitan comprender mejor el funcionamiento de los criptoactivos y los riesgos relacionados con su utilización.",
        },
        { type: "p", text: "Nuestros contenidos incluyen información sobre:" },
        {
          type: "ul",
          items: [
            "Criptomonedas y tecnología blockchain.",
            "Stablecoins como USDT y USDC.",
            "Operaciones P2P.",
            "Billeteras digitales y claves privadas.",
            "Prevención de estafas.",
            "Seguridad de cuentas y dispositivos.",
            "Comprensión de noticias relacionadas con el ecosistema cripto.",
          ],
        },
        { type: "p", text: "Los materiales ofrecidos tienen fines educativos e informativos." },
      ],
    },
    {
      id: "ausencia-de-servicios-financieros",
      title: "3. Ausencia de servicios financieros",
      blocks: [
        {
          type: "p",
          text: "Ruta Cripto Segura no opera como banco, exchange, proveedor de custodia ni intermediario de transferencias financieras.",
        },
        {
          type: "p",
          text: "El contenido educativo general no constituye asesoramiento financiero, jurídico o tributario personalizado.",
        },
        { type: "p", text: "No garantizamos resultados económicos ni rentabilidades." },
      ],
    },
    {
      id: "riesgos",
      title: "4. Riesgos de los activos digitales",
      blocks: [
        {
          type: "p",
          text: "Los criptoactivos pueden presentar riesgos importantes, incluyendo volatilidad, pérdida de valor, fallos tecnológicos, errores de transferencia, fraude, pérdida de acceso y cambios regulatorios.",
        },
        { type: "p", text: "Determinadas operaciones pueden ser irreversibles." },
        {
          type: "p",
          text: "Antes de utilizar cualquier plataforma, el usuario debe investigar las condiciones, tarifas, riesgos y requisitos aplicables en su jurisdicción.",
        },
      ],
    },
    {
      id: "plataformas-externas",
      title: "5. Plataformas externas",
      blocks: [
        {
          type: "p",
          text: "El sitio puede contener referencias y enlaces a servicios externos, incluyendo Binance, Bybit, MEXC y otras plataformas del ecosistema.",
        },
        {
          type: "p",
          text: "Estas plataformas son independientes y están sujetas a sus propios términos, políticas y restricciones territoriales.",
        },
        {
          type: "p",
          text: "La inclusión de sus nombres o enlaces no implica, por sí misma, patrocinio institucional, certificación oficial ni garantía de sus servicios.",
        },
      ],
    },
    {
      id: "transparencia-de-afiliados",
      title: "6. Transparencia de afiliados",
      blocks: [
        { type: "p", text: "Algunos enlaces publicados pueden formar parte de programas de afiliación." },
        {
          type: "p",
          text: "Cuando corresponda, Ruta Cripto Segura podrá recibir una comisión por determinadas acciones realizadas mediante esos enlaces.",
        },
        { type: "p", text: "La existencia de una relación de afiliación será comunicada de manera clara." },
        { type: "p", text: "Las decisiones de utilizar plataformas externas corresponden a cada usuario." },
      ],
    },
    {
      id: "propiedad-intelectual",
      title: "7. Propiedad intelectual",
      blocks: [
        {
          type: "p",
          text: "Los contenidos originales de Ruta Cripto Segura, incluyendo textos, diseños y materiales educativos propios, están sujetos a los derechos de propiedad intelectual que correspondan.",
        },
        { type: "p", text: "Las marcas y materiales de terceros pertenecen a sus respectivos titulares." },
        {
          type: "p",
          text: "Se permite la consulta personal de nuestros contenidos gratuitos. Cualquier uso comercial de materiales protegidos deberá respetar los derechos aplicables y las excepciones previstas por la ley.",
        },
      ],
    },
    {
      id: "actualizacion-de-contenidos",
      title: "8. Actualización de contenidos",
      blocks: [
        { type: "p", text: "Procuramos ofrecer información clara y actualizada." },
        {
          type: "p",
          text: "Sin embargo, las tecnologías, las plataformas y las regulaciones relacionadas con los activos digitales pueden cambiar.",
        },
        { type: "p", text: "Los usuarios deben consultar también las fuentes oficiales vigentes." },
      ],
    },
    {
      id: "contacto",
      title: "9. Contacto",
      blocks: [
        {
          type: "p",
          text: "Para consultas generales, correcciones o cuestiones relacionadas con el sitio:",
        },
        { type: "p", text: EMAIL },
        { type: "facts", rows: [["Telegram", TG_ADMIN]] },
      ],
    },
  ],
}
