// A stand-in for Upstash Redis' REST API: just the commands the bot uses, with real TTL behaviour.
import http from "node:http"

export function startFakeUpstash({ token, port }) {
  const kv = new Map()
  const stats = { commands: 0, bad_auth: 0, down: false }
  const alive = (key) => { const e = kv.get(key); if (!e) return undefined; if (e.exp !== null && e.exp <= Date.now()) { kv.delete(key); return undefined } return e }
  function run(cmd) {
    stats.commands++
    const [name, ...a] = cmd; const op = String(name).toUpperCase()
    switch (op) {
      case "PING": return "PONG"
      case "GET": return alive(a[0])?.value ?? null
      case "MGET": return a.map((k) => alive(k)?.value ?? null)
      case "DEL": { const had = !!alive(a[0]); kv.delete(a[0]); return had ? 1 : 0 }
      case "SET": {
        const [key, value, ...opts] = a; let ex = null, nx = false
        for (let i = 0; i < opts.length; i++) { const o = String(opts[i]).toUpperCase(); if (o === "EX") ex = Number(opts[++i]); else if (o === "NX") nx = true }
        if (nx && alive(key)) return null
        kv.set(key, { value: String(value), exp: ex ? Date.now() + ex * 1000 : null }); return "OK"
      }
      case "INCR": { const e = alive(a[0]); if (!e) { kv.set(a[0], { value: "1", exp: null }); return 1 } e.value = String(Number(e.value) + 1); return Number(e.value) }
      default: throw new Error(`ERR unknown command '${op}'`)
    }
  }
  const server = http.createServer(async (req, res) => {
    let raw = ""; for await (const chunk of req) raw += chunk
    const url = new URL(req.url, "http://x")
    if (url.pathname === "/__dump") { const out = {}; for (const k of [...kv.keys()]) { const e = alive(k); if (e) out[k] = e.value } res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify({ stats, keys: out })) }
    if (url.pathname === "/__down") { stats.down = JSON.parse(raw).down; res.writeHead(200); return res.end("{}") }
    if (url.pathname === "/__flush") { kv.clear(); res.writeHead(200); return res.end("{}") }
    if (req.headers.authorization !== `Bearer ${token}`) { stats.bad_auth++; res.writeHead(401, { "content-type": "application/json" }); return res.end(JSON.stringify({ error: "Unauthorized" })) }
    if (stats.down) { res.writeHead(503); return res.end(JSON.stringify({ error: "down" })) }
    try {
      const body = JSON.parse(raw)
      const reply = url.pathname === "/pipeline" ? body.map((c) => { try { return { result: run(c) } } catch (e) { return { error: e.message } } }) : { result: run(body) }
      res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify(reply))
    } catch (e) { res.writeHead(400, { "content-type": "application/json" }); res.end(JSON.stringify({ error: e.message })) }
  })
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve({ kv, stats, close: () => new Promise((r) => server.close(r)) })))
}
