/**
 * Legal documents are plain data. Text supports two inline markers:
 *   [label](href)  -> a link (internal path, mailto: or https://)
 *   the pending marker from ./config -> a visible "pending" chip
 */
export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  /** "Label: value" lines, rendered as one card. */
  | { type: "facts"; rows: [label: string, value: string][] }
  /** The audited list of cookies and similar technologies (cookie policy only). */
  | { type: "cookie-inventory" }
  /** Button that opens the cookie preferences dialog (cookie policy only). */
  | { type: "cookie-settings" }

export type LegalSection = { id: string; title: string; blocks: LegalBlock[] }
export type LegalDoc = { title: string; sections: LegalSection[] }
