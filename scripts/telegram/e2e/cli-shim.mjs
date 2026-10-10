// Lets the REAL scripts/telegram/webhook.mjs run against local fakes: api.telegram.org -> fake Telegram,
// and a made-up public HTTPS site name -> the locally running build. The script itself is not modified.
const realFetch = globalThis.fetch
const MAP = [["https://api.telegram.org", "http://127.0.0.1:4010"], ["https://bot-test.example", "http://127.0.0.1:3101"]]
globalThis.fetch = (input, init) => {
  let url = String(input)
  for (const [from, to] of MAP) if (url.startsWith(from)) url = to + url.slice(from.length)
  return realFetch(url, init)
}
