// DashOff pledge counter, backing the "N notices generated" line on the
// landing page. Plain JS, zero dependencies.
//
// GET  /        -> { count, goal }
// POST /        -> increments the count by 1 and returns the new total.
//                  No request body is read. No PII is accepted or stored.
//                  Rate-limited to one increment per IP per hour, using a
//                  short-TTL KV key so no IP address is retained after the
//                  window closes (only a hash of it is ever written, and
//                  only for that hour).
//
// The running total is stored in a Durable Object (Counter, below), not KV.
// A Durable Object instance processes one request at a time, so a plain
// read-modify-write against its own storage is atomic across every
// concurrent caller by construction: two POSTs racing each other cannot
// both read the same starting value and drop an increment, the way they
// could against KV's eventually-consistent, last-write-wins get/put. KV is
// still the right tool for the per-IP rate-limit marker below: it is a
// TTL'd, per-key value with no cross-request ordering requirement, exactly
// what KV is good at.
//
// Bindings (see wrangler.jsonc):
//   COUNTER      KV namespace. Keys: "ip:<sha256>" (rate-limit marker, TTL'd).
//   COUNTER_DO   Durable Object namespace, class Counter (this file). Holds
//                the running total in its own transactional storage.
//   SITE_ORIGIN  Var. The exact origin allowed to call this worker via CORS,
//                e.g. "https://dashoff.example". Set per environment.
//   GOAL         Var, optional. Defaults to 5000 if unset.

const DEFAULT_GOAL = 5000
const RATE_LIMIT_SECONDS = 60 * 60 // one increment per IP per hour

// Holds the running total. All requests are routed to a single named
// instance (idFromName('global')), so the Workers runtime's own
// single-threaded-per-instance guarantee is what makes increments atomic,
// no compare-and-swap or locking needed here.
export class Counter {
  constructor(state) {
    this.state = state
    this.count = null
  }

  async loadCount() {
    if (this.count === null) {
      this.count = (await this.state.storage.get('count')) || 0
    }
    return this.count
  }

  async fetch(request) {
    const url = new URL(request.url)

    if (request.method === 'GET') {
      const count = await this.loadCount()
      return new Response(JSON.stringify({ count }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (request.method === 'POST' && url.pathname === '/increment') {
      const count = (await this.loadCount()) + 1
      this.count = count
      await this.state.storage.put('count', count)
      return new Response(JSON.stringify({ count }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response('Not found', { status: 404 })
  }
}

function corsHeaders(env) {
  // A single fixed trusted origin, set via the SITE_ORIGIN var. The browser
  // itself enforces the match against the page's real origin, so this does
  // not need to inspect the incoming Origin header to be safe.
  const allowed = env.SITE_ORIGIN || ''
  return {
    'Access-Control-Allow-Origin': allowed || 'null',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  }
}

async function hashIP(ip) {
  const data = new TextEncoder().encode(ip)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  })
}

export default {
  async fetch(request, env) {
    const headers = corsHeaders(env)
    const goal = Number(env.GOAL) || DEFAULT_GOAL
    const counterStub = env.COUNTER_DO.get(env.COUNTER_DO.idFromName('global'))

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers })
    }

    if (request.method === 'GET') {
      const res = await counterStub.fetch('https://counter/')
      const { count } = await res.json()
      return json({ count, goal }, 200, headers)
    }

    if (request.method === 'POST') {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
      const ipKey = `ip:${await hashIP(ip)}`
      const alreadyCounted = await env.COUNTER.get(ipKey)

      if (alreadyCounted) {
        const res = await counterStub.fetch('https://counter/')
        const { count } = await res.json()
        return json({ count, goal, limited: true }, 429, headers)
      }

      const incRes = await counterStub.fetch('https://counter/increment', { method: 'POST' })
      const { count } = await incRes.json()
      await env.COUNTER.put(ipKey, '1', { expirationTtl: RATE_LIMIT_SECONDS })

      return json({ count, goal }, 200, headers)
    }

    return new Response('Method not allowed', { status: 405, headers })
  }
}
