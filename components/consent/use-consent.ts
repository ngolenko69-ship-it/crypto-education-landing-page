import { useSyncExternalStore } from "react"
import { getConsentSnapshot, getServerSnapshot, subscribeConsent } from "@/lib/consent"

/** Current consent. On the server and during hydration `ready` is false, so nothing flashes. */
export function useConsent() {
  return useSyncExternalStore(subscribeConsent, getConsentSnapshot, getServerSnapshot)
}
