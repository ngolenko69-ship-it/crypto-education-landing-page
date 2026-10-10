import type { LegalDoc } from "./types"
import { COOKIES_LINK, EMAIL, OWNER } from "./markup"

export const politicaDePrivacidad: LegalDoc = {
  title: "Política de Privacidad",
  sections: [
    {
      id: "introduccion",
      title: "1. Introducción",
      blocks: [
        {
          type: "p",
          text: "En Ruta Cripto Segura respetamos la privacidad de nuestros visitantes y reconocemos la importancia de proteger la información personal.",
        },
        {
          type: "p",
          text: "Esta política describe las categorías de datos que pueden tratarse al utilizar nuestro sitio, comunicarse con el proyecto o participar voluntariamente en nuestra comunidad.",
        },
      ],
    },
    {
      id: "responsable",
      title: "2. Responsable del tratamiento",
      blocks: [
        {
          type: "facts",
          rows: [
            ["Proyecto", "Ruta Cripto Segura"],
            ["Responsable legal", OWNER],
            ["Contacto para cuestiones de privacidad", EMAIL],
          ],
        },
        {
          type: "p",
          text: "Los datos de identificación del responsable deberán completarse de acuerdo con la legislación aplicable antes de considerar finalizado el cumplimiento legal.",
        },
      ],
    },
    {
      id: "datos-recopilados",
      title: "3. Datos que pueden recopilarse",
      blocks: [
        {
          type: "p",
          text: "Dependiendo de la interacción del usuario y de las herramientas efectivamente utilizadas, podrán tratarse las siguientes categorías de información:",
        },
        { type: "h3", text: "Datos de contacto" },
        {
          type: "p",
          text: "Dirección de correo electrónico, nombre y otros datos que el usuario facilite voluntariamente.",
        },
        { type: "h3", text: "Comunicaciones" },
        { type: "p", text: "Mensajes enviados por correo electrónico o mediante los canales oficiales." },
        { type: "h3", text: "Datos técnicos" },
        {
          type: "p",
          text: "Datos técnicos necesarios para el funcionamiento y la seguridad del sitio, conforme a la configuración real del proveedor de alojamiento.",
        },
        { type: "h3", text: "Datos de Telegram" },
        {
          type: "p",
          text: "La participación voluntaria en nuestra comunidad puede implicar el tratamiento de nombres de usuario, identificadores, mensajes y otros datos accesibles según la configuración de Telegram.",
        },
        {
          type: "p",
          text: "Ruta Cripto Segura no solicita frases semilla, claves privadas, contraseñas de exchanges ni códigos de autenticación.",
        },
      ],
    },
    {
      id: "finalidades",
      title: "4. Finalidades del tratamiento",
      blocks: [
        {
          type: "p",
          text: "Los datos personales podrán utilizarse, cuando exista una base legal adecuada, para:",
        },
        {
          type: "ul",
          items: [
            "Responder consultas.",
            "Gestionar comunicaciones solicitadas por usuarios.",
            "Facilitar recursos educativos.",
            "Mantener la seguridad del sitio.",
            "Prevenir suplantaciones y abusos.",
            "Administrar la comunidad educativa.",
            "Cumplir obligaciones legales.",
            "Mejorar el funcionamiento del sitio mediante herramientas utilizadas legalmente.",
          ],
        },
        { type: "p", text: "No enviaremos comunicaciones comerciales no solicitadas." },
      ],
    },
    {
      id: "bases-legales",
      title: "5. Bases legales",
      blocks: [
        { type: "p", text: "El tratamiento de datos se realizará conforme a la legislación aplicable." },
        {
          type: "p",
          text: "Según el caso, podrá fundamentarse en el consentimiento del usuario, la atención de solicitudes, el cumplimiento de obligaciones legales u otras bases legítimas reconocidas por la normativa correspondiente.",
        },
        {
          type: "p",
          text: "Las bases específicas deberán concretarse de acuerdo con los tratamientos reales y la jurisdicción aplicable.",
        },
      ],
    },
    {
      id: "servicios-externos",
      title: "6. Servicios externos",
      blocks: [
        { type: "p", text: "El proyecto utiliza o puede utilizar los siguientes servicios:" },
        {
          type: "facts",
          rows: [
            ["Vercel", "alojamiento e infraestructura técnica del sitio."],
            ["Google / Gmail", "gestión de comunicaciones recibidas por correo electrónico."],
            ["Telegram", "comunicaciones y participación voluntaria en la comunidad."],
          ],
        },
        // ADDED after the technical audit: Vercel Web Analytics is real, optional and consent-gated.
        {
          type: "p",
          text: `Vercel también ofrece Vercel Web Analytics, una herramienta opcional de analítica agregada que solo se carga si aceptas las cookies analíticas. Más información en la ${COOKIES_LINK}.`,
        },
        {
          type: "p",
          text: "El uso de estos servicios puede implicar el tratamiento de datos por proveedores independientes y, en determinados casos, transferencias internacionales de información.",
        },
        {
          type: "p",
          text: "Si se incorporan servicios adicionales de analítica, publicidad, automatización o pagos, esta política deberá actualizarse.",
        },
      ],
    },
    {
      id: "telegram",
      title: "7. Telegram",
      blocks: [
        { type: "p", text: "La participación en nuestra comunidad de Telegram es voluntaria." },
        {
          type: "p",
          text: "Los usuarios deben comprender que determinados datos de perfil y mensajes pueden ser visibles para otros participantes, dependiendo del tipo de grupo y su configuración.",
        },
        {
          type: "p",
          text: "Recomendamos no compartir datos financieros sensibles, documentos personales, claves privadas, contraseñas o frases de recuperación.",
        },
        { type: "p", text: "La plataforma Telegram aplica sus propias políticas y condiciones." },
      ],
    },
    {
      id: "conservacion",
      title: "8. Conservación de datos",
      blocks: [
        {
          type: "p",
          text: "Los datos personales se conservarán durante el tiempo necesario para las finalidades correspondientes o mientras exista una obligación legal de conservación.",
        },
        {
          type: "p",
          text: "Los plazos concretos de conservación deberán documentarse según el funcionamiento real del correo, los registros del alojamiento y la administración de Telegram.",
        },
        { type: "p", text: "Cuando proceda, los datos serán eliminados o anonimizados." },
      ],
    },
    {
      id: "derechos",
      title: "9. Derechos de los usuarios",
      blocks: [
        {
          type: "p",
          text: "Los usuarios podrán ejercer los derechos reconocidos por la legislación aplicable, entre ellos los de acceso, rectificación, actualización, supresión, oposición y retirada del consentimiento, cuando correspondan.",
        },
        { type: "p", text: "Para realizar una solicitud:" },
        { type: "p", text: EMAIL },
        {
          type: "p",
          text: "Podrá requerirse una verificación razonable de identidad antes de atender determinadas solicitudes.",
        },
        {
          type: "p",
          text: "Los usuarios también podrán acudir a la autoridad de protección de datos competente cuando corresponda.",
        },
      ],
    },
    {
      id: "seguridad",
      title: "10. Seguridad",
      blocks: [
        {
          type: "p",
          text: "Adoptamos medidas razonables destinadas a proteger los datos frente a accesos no autorizados, pérdida, alteración o utilización indebida.",
        },
        { type: "p", text: "Ningún servicio conectado a Internet puede garantizar seguridad absoluta." },
      ],
    },
    {
      id: "transferencias-internacionales",
      title: "11. Transferencias internacionales",
      blocks: [
        {
          type: "p",
          text: "La utilización de proveedores internacionales puede implicar tratamiento de datos en distintos países.",
        },
        {
          type: "p",
          text: "Cuando la legislación aplicable lo requiera, deberán implementarse las garantías y medidas correspondientes.",
        },
        {
          type: "p",
          text: "La información específica sobre países de tratamiento y garantías deberá completarse según los proveedores y configuraciones reales.",
        },
      ],
    },
    {
      id: "cookies",
      title: "12. Cookies",
      blocks: [
        {
          type: "p",
          text: `El uso de cookies y tecnologías similares se describe en nuestra ${COOKIES_LINK}.`,
        },
        {
          type: "p",
          text: "Las tecnologías que requieran consentimiento previo no deberán activarse antes de obtenerlo, cuando así lo exija la legislación aplicable.",
        },
      ],
    },
    {
      id: "menores",
      title: "13. Menores de edad",
      blocks: [
        {
          type: "p",
          text: "Nuestros contenidos están orientados principalmente a personas adultas interesadas en la educación sobre activos digitales.",
        },
        {
          type: "p",
          text: "No buscamos recopilar deliberadamente información personal de menores sin cumplir las condiciones legales aplicables.",
        },
      ],
    },
    {
      id: "actualizaciones",
      title: "14. Actualizaciones",
      blocks: [
        {
          type: "p",
          text: "Esta política podrá modificarse cuando cambien los servicios, las tecnologías utilizadas o las obligaciones legales.",
        },
        { type: "p", text: "La versión vigente estará disponible en el sitio web." },
      ],
    },
    {
      id: "contacto",
      title: "15. Contacto",
      blocks: [
        { type: "p", text: "Para cuestiones relacionadas con privacidad:" },
        { type: "p", text: EMAIL },
      ],
    },
  ],
}
