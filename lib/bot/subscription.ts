import { TelegramApiError, type TelegramApi } from "./telegram-api"
import type { TgChatMember } from "./types"

/**
 * Whether a getChatMember answer means "currently in the channel".
 * "restricted" is a member only while is_member is true; "left" and "kicked" never are.
 */
export function isActiveMember(member: TgChatMember): boolean {
  switch (member.status) {
    case "creator":
    case "administrator":
    case "member":
      return true
    case "restricted":
      return member.is_member === true
    default:
      return false
  }
}

export type SubscriptionCheck =
  | { state: "subscribed" }
  | { state: "not_subscribed" }
  | { state: "error"; error: TelegramApiError }

/**
 * Asks Telegram — never the user — whether this Telegram user id is in the channel.
 * The id comes from the update itself, so pressing a button proves nothing by itself.
 */
export async function checkSubscription(api: TelegramApi, channelChatId: string, userId: number): Promise<SubscriptionCheck> {
  try {
    const member = await api.getChatMember(channelChatId, userId)
    return { state: isActiveMember(member) ? "subscribed" : "not_subscribed" }
  } catch (error) {
    if (!(error instanceof TelegramApiError)) throw error
    // Telegram answers "user not found" for accounts it has never seen in the channel: not a subscriber.
    if (error.kind === "bad_request" && /user not found|participant_id_invalid/i.test(error.message)) return { state: "not_subscribed" }
    return { state: "error", error }
  }
}
