// The slice of the Telegram Bot API this bot reads and writes — only the fields it actually uses.
// Names, usernames and message texts are deliberately not modelled: the bot never reads them.

export type TgUser = {
  id: number
  is_bot?: boolean
}

export type TgChat = {
  id: number
  type: "private" | "group" | "supergroup" | "channel"
}

export type TgDocument = {
  file_id: string
  file_unique_id?: string
  file_name?: string
  mime_type?: string
  file_size?: number
}

export type TgMessage = {
  message_id: number
  chat: TgChat
  from?: TgUser
  text?: string
  caption?: string
  document?: TgDocument
}

export type TgCallbackQuery = {
  id: string
  from: TgUser
  data?: string
}

export type TgUpdate = {
  update_id: number
  message?: TgMessage
  callback_query?: TgCallbackQuery
}

export type TgChatMemberStatus = "creator" | "administrator" | "member" | "restricted" | "left" | "kicked"

export type TgChatMember = {
  status: TgChatMemberStatus
  /** Only meaningful for "restricted": whether the user is still in the chat. */
  is_member?: boolean
}

export type InlineButton = { text: string; url?: string; callback_data?: string }
export type InlineKeyboard = { inline_keyboard: InlineButton[][] }

export type WebhookInfo = {
  url: string
  pending_update_count: number
  last_error_date?: number
  last_error_message?: string
  allowed_updates?: string[]
}
