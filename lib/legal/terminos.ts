import type { LegalDoc } from "./types"
import { COOKIES_LINK, EMAIL, PRIVACY_LINK, TG_MANAGER } from "./markup"

export const terminos: LegalDoc = {
  title: "Términos y Condiciones",
  sections: [
    {
      id: "objeto",
      title: "1. Objeto",
      blocks: [
        {
          type: "p",
          text: "Estos términos establecen las condiciones generales de uso del sitio web Ruta Cripto Segura y de sus recursos educativos gratuitos.",
        },
      ],
    },
    {
      id: "naturaleza-del-proyecto",
      title: "2. Naturaleza del proyecto",
      blocks: [
        {
          type: "p",
          text: "Ruta Cripto Segura es una iniciativa educativa independiente especializada en criptomonedas, activos digitales y seguridad digital.",
        },
        {
          type: "p",
          text: "Nuestro objetivo es facilitar información comprensible para personas que desean aprender a utilizar herramientas del ecosistema cripto con mayor criterio.",
        },
      ],
    },
    {
      id: "uso-educativo",
      title: "3. Uso educativo",
      blocks: [
        { type: "p", text: "Los materiales ofrecidos tienen fines educativos e informativos." },
        {
          type: "p",
          text: "Los contenidos gratuitos no requieren que el usuario deposite criptomonedas ni realice inversiones para acceder a ellos.",
        },
      ],
    },
    {
      id: "informacion-financiera",
      title: "4. Información financiera",
      blocks: [
        {
          type: "p",
          text: "Los contenidos educativos generales no constituyen asesoramiento financiero, jurídico o tributario personalizado.",
        },
        { type: "p", text: "No ofrecemos garantías de rentabilidad o resultados económicos." },
        {
          type: "p",
          text: "Cada usuario debe evaluar los riesgos y, cuando resulte necesario, solicitar orientación profesional independiente.",
        },
      ],
    },
    {
      id: "riesgos",
      title: "5. Riesgos",
      blocks: [
        { type: "p", text: "Las operaciones con criptoactivos pueden ocasionar pérdidas económicas." },
        {
          type: "p",
          text: "Los riesgos incluyen volatilidad, fraude, pérdida de acceso a billeteras, errores de transferencia, fallos de plataformas y cambios regulatorios.",
        },
        {
          type: "p",
          text: "Antes de operar, el usuario debe verificar las características del activo, la red, las comisiones, las condiciones de la plataforma y las normas aplicables.",
        },
      ],
    },
    {
      id: "enlaces-externos",
      title: "6. Enlaces externos",
      blocks: [
        { type: "p", text: "El sitio puede incluir enlaces a plataformas y materiales educativos de terceros." },
        {
          type: "p",
          text: "Las condiciones, tarifas y servicios de esos terceros son independientes de Ruta Cripto Segura.",
        },
        { type: "p", text: "El usuario debe revisar sus términos y políticas antes de utilizarlos." },
      ],
    },
    {
      id: "enlaces-de-afiliados",
      title: "7. Enlaces de afiliados",
      blocks: [
        { type: "p", text: "Determinados enlaces pueden formar parte de programas de afiliación." },
        { type: "p", text: "Cuando corresponda, esta relación será identificada claramente." },
        {
          type: "p",
          text: "La participación en programas de referidos no implica necesariamente patrocinio institucional, licencia o certificación oficial.",
        },
      ],
    },
    {
      id: "comunidad-educativa",
      title: "8. Comunidad educativa",
      blocks: [
        {
          type: "p",
          text: "Ruta Cripto Segura puede ofrecer espacios gratuitos de participación en Telegram.",
        },
        {
          type: "p",
          text: "Los participantes deben mantener una conducta respetuosa y abstenerse de:",
        },
        {
          type: "ul",
          items: [
            "Publicar mensajes fraudulentos.",
            "Suplantar a administradores.",
            "Difundir enlaces maliciosos.",
            "Solicitar claves privadas o frases semilla.",
            "Promover estafas.",
            "Publicar spam.",
            "Realizar promesas engañosas de ganancias.",
          ],
        },
        {
          type: "p",
          text: "Los administradores podrán aplicar medidas razonables de moderación conforme a las reglas de la comunidad y a los derechos aplicables.",
        },
      ],
    },
    {
      id: "seguridad-de-las-comunicaciones",
      title: "9. Seguridad de las comunicaciones",
      blocks: [
        {
          type: "p",
          text: "Ruta Cripto Segura no solicita contraseñas, códigos de autenticación ni frases semilla por mensajes privados.",
        },
        {
          type: "p",
          text: "Ante contactos sospechosos, los usuarios deben verificar la identidad del remitente a través de los canales oficiales.",
        },
      ],
    },
    {
      id: "propiedad-intelectual",
      title: "10. Propiedad intelectual",
      blocks: [
        { type: "p", text: "Los materiales originales pertenecen a sus respectivos titulares." },
        {
          type: "p",
          text: "Su reproducción, redistribución o utilización comercial debe respetar los derechos correspondientes y las excepciones legales aplicables.",
        },
      ],
    },
    {
      id: "disponibilidad",
      title: "11. Disponibilidad",
      blocks: [
        { type: "p", text: "El proyecto procurará mantener accesibles sus materiales educativos." },
        {
          type: "p",
          text: "Podrán realizarse actualizaciones, correcciones o modificaciones necesarias para mantener la calidad y seguridad del contenido.",
        },
      ],
    },
    {
      id: "responsabilidad",
      title: "12. Responsabilidad",
      blocks: [
        { type: "p", text: "Ruta Cripto Segura procura publicar información educativa de buena fe." },
        {
          type: "p",
          text: "Las decisiones individuales relacionadas con plataformas externas y activos digitales deben tener en cuenta sus riesgos.",
        },
        {
          type: "p",
          text: "Ninguna disposición de estos términos limita los derechos irrenunciables de los consumidores ni excluye responsabilidades que legalmente no puedan excluirse.",
        },
      ],
    },
    {
      id: "proteccion-de-datos",
      title: "13. Protección de datos",
      blocks: [
        {
          type: "p",
          text: `La información relativa al tratamiento de datos personales se encuentra en nuestra ${PRIVACY_LINK} y ${COOKIES_LINK}.`,
        },
      ],
    },
    {
      id: "servicios-futuros",
      title: "14. Servicios futuros",
      blocks: [
        {
          type: "p",
          text: "Las eventuales suscripciones de pago o servicios adicionales estarán sujetos a condiciones específicas que deberán comunicarse antes de su contratación.",
        },
        {
          type: "p",
          text: "Estas condiciones deberán explicar precios, duración, renovación, cancelación, devoluciones y otros derechos aplicables.",
        },
        { type: "p", text: "Los presentes términos no sustituyen dichas condiciones futuras." },
      ],
    },
    {
      id: "legislacion-aplicable",
      title: "15. Legislación aplicable",
      blocks: [
        {
          type: "p",
          text: "La interpretación y aplicación de estos términos dependerá de la legislación correspondiente al responsable real del proyecto y de las normas imperativas de protección de usuarios que resulten aplicables.",
        },
        {
          type: "p",
          text: "La información sobre la identificación legal del operador y la jurisdicción deberá completarse cuando sea determinada.",
        },
      ],
    },
    {
      id: "contacto",
      title: "16. Contacto",
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
