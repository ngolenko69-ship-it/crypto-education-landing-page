/** Date shown on every legal document. Change it whenever a document's content changes. */
export const LEGAL_UPDATED = "10 de octubre de 2026"
export const LEGAL_UPDATED_ISO = "2026-10-10"

/**
 * The legal identification of whoever operates the site is NOT known yet: the project is not
 * registered as a legal entity and no real owner data has been supplied. The marker below is
 * rendered as a visible "pending" chip on every page that mentions it. When the real,
 * verified data exists, replace this ONE constant and every page updates (the chip styling
 * disappears automatically).
 */
export const PENDING_MARKER = "[DATOS REALES PENDIENTES DE CONFIRMACIÓN]"
export const LEGAL_OWNER: string = PENDING_MARKER
