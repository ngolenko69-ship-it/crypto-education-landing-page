// One JSON line per event, with every known secret stripped out of everything printed.
// Message texts, names, usernames and raw user ids are never passed to the logger.

export type LogData = Record<string, string | number | boolean | null | undefined>

export type Logger = {
  info(event: string, data?: LogData): void
  warn(event: string, data?: LogData): void
  error(event: string, data?: LogData): void
}

type Sink = Pick<Console, "log" | "warn" | "error">

export function createLogger(secrets: readonly string[], sink: Sink = console): Logger {
  const strip = (text: string) => secrets.reduce((acc, secret) => (secret ? acc.split(secret).join("[redacted]") : acc), text)

  const emit = (level: keyof Sink, event: string, data?: LogData) => {
    const payload: Record<string, unknown> = { evt: event }
    for (const [key, value] of Object.entries(data ?? {})) payload[key] = typeof value === "string" ? strip(value) : value
    sink[level](strip(JSON.stringify(payload)))
  }

  return {
    info: (event, data) => emit("log", event, data),
    warn: (event, data) => emit("warn", event, data),
    error: (event, data) => emit("error", event, data),
  }
}

/** A loggable summary of an error: its kind and message, never the object or its stack. */
export function describeError(error: unknown): LogData {
  if (error instanceof Error) {
    const withDetails = error as Error & { kind?: unknown; code?: unknown }
    return {
      err: error.name,
      kind: typeof withDetails.kind === "string" ? withDetails.kind : undefined,
      code: typeof withDetails.code === "number" ? withDetails.code : undefined,
      msg: error.message.slice(0, 300),
    }
  }
  return { err: "non-error", msg: String(error).slice(0, 300) }
}
