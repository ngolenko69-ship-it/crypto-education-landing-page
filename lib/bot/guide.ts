import type { BotConfig } from "./config"
import type { Store } from "./store"

// The guide is never stored by us: the owner uploads the PDF to Telegram once (by sending it to the
// bot) and we keep only the file_id Telegram returns. Sending by file_id is instant and needs no
// public link, no repository file and no disk.

export const MAIN_GUIDE = "main"

export type GuideRecord = {
  fileId: string
  fileName: string | null
  size: number | null
  savedAt: string
  /** Where the file_id came from: the store (uploaded through the bot) or the emergency env variable. */
  source: "store" | "env"
}

const key = (id: string) => `guide:${id}`

export async function loadGuide(store: Store, config: BotConfig, id: string = MAIN_GUIDE): Promise<GuideRecord | null> {
  const raw = await store.get(key(id))
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<GuideRecord>
      if (typeof parsed.fileId === "string" && parsed.fileId.length >= 20) {
        return {
          fileId: parsed.fileId,
          fileName: typeof parsed.fileName === "string" ? parsed.fileName : null,
          size: typeof parsed.size === "number" ? parsed.size : null,
          savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : "",
          source: "store",
        }
      }
    } catch {
      // A damaged record is treated as missing; the owner uploads the PDF again.
    }
  }
  if (id === MAIN_GUIDE && config.guideFileIdFallback) {
    return { fileId: config.guideFileIdFallback, fileName: null, size: null, savedAt: "", source: "env" }
  }
  return null
}

export async function saveGuide(store: Store, id: string, record: Omit<GuideRecord, "source">): Promise<void> {
  await store.set(key(id), JSON.stringify(record))
}
