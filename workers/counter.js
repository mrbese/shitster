// DashOff pledge counter, backing the "N notices generated" line on the
// landing page. Plain JS, zero dependencies.
//
// GET  /        -> { count, goal }
// POST /        -> increments the count by 1 and returns the new total.
//                  No request body is read. No PII is accepted or stored.
//                  Rejected up front if the request's Origin header does not
//                  match SITE_ORIGIN. Rate-limited to one increment per IP
//                  per hour, tracked as a hash of the IP against a
//                  last-increment timestamp inside the Durable Object below,
//                  so no IP address is ever written to storage, only a
//                  SHA-256 hash of it, and only the timestamp of its last
//                  successful increment.
//
// Both the running total and the per-IP rate-limit state live in the same
// Durable Object (Counter, below), not KV. A Durable Object instance
// processes one request at a time, so a plain read-check-write against its
// own storage is atomic across every concurrent caller by construction: two
// POSTs racing each other cannot both read the same rate-limit state (or the
// same count) and both proceed, the way they could against KV's eventually
// consistent, last-write-wins get/put. Keeping the rate-limit check and the
// increment in the same Durable Object fetch() call is what makes the whole
// operation atomic; splitting them across a KV get/put and a separate DO
// call (the previous design) reopened exactly the same race between the KV
// read and the KV write that the count itself was moved off KV to avoid.
//
// The per-IP-hash rate-limit entries (rl:<hash>) are pruned by a recurring
// Durable Object alarm (see alarm() below) once each one's RATE_LIMIT_MS
// window has passed, so storage does not grow without bound as distinct IPs
// hit the endpoint over time.
//
// Bindings (see wrangler.jsonc):
//   COUNTER_DO   Durable Object namespace, class Counter (this file). Holds
//                the running total and the per-IP-hash rate-limit state in
//                its own transactional storage.
//   SITE_ORIGIN  Var. The exact origin allowed to call this worker,
//                e.g. "https://dashoff.example". Set per environment. Also
//                enforced server-side on every POST, not just via CORS.
//   GOAL         Var, optional. Defaults to 5000 if unset.

const DEFAULT_GOAL = 5000
const RATE_LIMIT_MS = 60 * 60 * 1000 // one increment per IP per hour

// Holds the running total and the per-IP-hash rate-limit timestamps. All
// requests are routed to a single named instance (idFromName('global')), so
// the Workers runtime's own single-threaded-per-instance guarantee is what
// makes both the count increment and the rate-limit check atomic, no
// compare-and-swap or locking needed here.
export class Counter {
  constructor(state) {
    this.state = state
    this.count = null
    // rl:<hash> rate-limit entries are written on every increment and never
    // read again once RATE_LIMIT_MS has passed, so without pruning they grow
    // without bound as distinct IPs hit the endpoint over time. Schedule a
    // recurring alarm to sweep expired entries, if one is not already
    // pending (e.g. this is a fresh instance after an eviction, not the
    // object's first-ever construction).
    this.state.blockConcurrencyWhile(async () => {
      // A throwing blockConcurrencyWhile callback terminates and resets the
      // whole object, failing the very request that woke it. Arming the
      // housekeeping alarm is never worth that: on a storage hiccup, skip it
      // and let the next construction (or a successful alarm run) re-arm.
      try {
        const existingAlarm = await this.state.storage.getAlarm()
        if (existingAlarm === null) {
          await this.state.storage.setAlarm(Date.now() + RATE_LIMIT_MS)
        }
      } catch {
        // Housekeeping only; the counter must still serve.
      }
    })
  }

  // Deletes rl:<hash> entries whose rate-limit window has already expired,
  // then reschedules itself. Runs on the same storage the increment path
  // uses, so it is subject to the same single-threaded-per-instance
  // guarantee: it cannot race a concurrent increment's read-check-write.
  // list() is paginated and delete() is chunked because the storage API
  // caps delete(keys) at 128 keys per call and an unbounded list() reads
  // every entry into memory; one busy hour past those limits would
  // otherwise throw, exhaust the alarm's retries, and end pruning forever.
  async alarm() {
    const now = Date.now()
    const PAGE = 128
    let startAfter = undefined
    while (true) {
      const entries = await this.state.storage.list({
        prefix: 'rl:',
        limit: PAGE,
        ...(startAfter ? { startAfter } : {})
      })
      if (entries.size === 0) break
      const stale = []
      for (const [key, lastAt] of entries) {
        if (typeof lastAt !== 'number' || now - lastAt >= RATE_LIMIT_MS) {
          stale.push(key)
        }
        startAfter = key
      }
      if (stale.length) {
        await this.state.storage.delete(stale)
      }
      if (entries.size < PAGE) break
    }
    await this.state.storage.setAlarm(Date.now() + RATE_LIMIT_MS)
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
      const ipHash = url.searchParams.get('ip') || ''
      const now = Date.now()

      // Rate-limit check and the increment itself both happen inside this
      // one fetch() invocation, against this Durable Object's own storage,
      // with no other await in between that could let a concurrent request
      // interleave. That is what makes "have they incremented in the last
      // hour, and if not, record now and increment" atomic.
      if (ipHash) {
        const rateLimitKey = `rl:${ipHash}`
        const lastAt = await this.state.storage.get(rateLimitKey)
        if (typeof lastAt === 'number' && now - lastAt < RATE_LIMIT_MS) {
          const count = await this.loadCount()
          return new Response(JSON.stringify({ count, limited: true }), {
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          })
        }
        await this.state.storage.put(rateLimitKey, now)
      }

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
  // A single fixed trusted origin, set via the SITE_ORIGIN var. Browsers
  // enforce this themselves for browser-originated requests, but POST is
  // additionally checked server-side below, since CORS headers alone do
  // nothing to stop a non-browser client from calling this endpoint
  // directly with a forged or absent Origin header.
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
      // Reject before doing any work if the Origin does not match the
      // configured site origin exactly. This is a public write endpoint (it
      // increments a shared counter); checking Origin server-side closes
      // the gap CORS alone leaves open, since CORS is a browser-enforced
      // convention that a script running outside a browser can simply
      // ignore by omitting or forging the header, and an absent header is
      // treated as a mismatch, not an exemption.
      const origin = request.headers.get('Origin')
      if (!env.SITE_ORIGIN || origin !== env.SITE_ORIGIN) {
        return json({ error: 'origin not allowed' }, 403, headers)
      }

      const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
      const ipHash = await hashIP(ip)
      const incRes = await counterStub.fetch(
        `https://counter/increment?ip=${encodeURIComponent(ipHash)}`,
        { method: 'POST' }
      )
      const body = await incRes.json()
      return json(
        { count: body.count, goal, ...(body.limited ? { limited: true } : {}) },
        incRes.status,
        headers
      )
    }

    return new Response('Method not allowed', { status: 405, headers })
  }
}
