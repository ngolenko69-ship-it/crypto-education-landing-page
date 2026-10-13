// Tiny events the page's overlays use to stay out of each other's way. Plain strings, so any
// component can listen without importing another component.

/** The final invitation just opened: anything else floating on the page closes. */
export const FINAL_POPUP_OPEN_EVENT = "ruta:final-popup-open"
