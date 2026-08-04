# DashOff pledge counter (Cloudflare Worker)

Backs the "N notices generated. Goal 5,000." line on the landing page. It is
entirely optional. The site ships with a static `/counter.json` and works
with zero infrastructure; deploy this only if you want a real, live count.

The worker is plain JavaScript with no dependencies. GET returns the count.
POST is checked against the `SITE_ORIGIN` var before anything else runs, then
increments the count once per IP per hour. No request body or personal data
is ever read or stored.

## Storage: everything in one Durable Object, no KV

Both the running total and the per-IP rate-limit state live in a single
Durable Object (the `Counter` class in `counter.js`). Earlier versions of
this worker kept the count in KV, and later kept a separate KV key per IP as
the rate-limit marker. Both designs shared the same flaw: KV is eventually
consistent and has no compare-and-swap, so two requests landing on different
colos at the same moment could both read the same starting value (the count,
or "have I already incremented this hour") and only one write would stick,
silently dropping the other or letting a rate limit slip, worst of all
during the traffic spikes when it matters most.

A Durable Object instance handles one request at a time, so a plain
read-check-write against its own storage is atomic for free, no locking or
compare-and-swap needed, as long as the check and the write happen inside
the same Durable Object call. That is why the rate-limit check now lives
inside the Durable Object's own `fetch()` handler alongside the increment,
instead of a separate KV lookup before it: keeping them in the same
single-threaded call is what makes "check the per-IP-hash timestamp, and if
it's been over an hour, record now and increment" atomic. All requests route
to a single named instance (`idFromName('global')`) so every call goes
through the same serialized queue. There is no KV binding in this worker
anymore.

## Origin check

Every POST is checked against the `SITE_ORIGIN` var before the Durable
Object is touched at all: if the request's `Origin` header does not exactly
match `SITE_ORIGIN` (including a missing header), the worker returns 403
immediately. This is enforced server-side, not just via the CORS response
headers: CORS is a browser-enforced convention, so a script running outside
a browser can call this URL directly with a forged or absent Origin header
and ignore CORS entirely. The server-side check is what actually stops that.

## Deploy

Requires a Cloudflare account and the `wrangler` CLI (`npm install -g
wrangler`, or use `npx wrangler`).

1. Set `SITE_ORIGIN` in `wrangler.jsonc` to the exact origin your site is
   deployed at, for example `"https://dashoff.org"`. This is both the only
   origin the worker answers CORS requests from and the only origin its POST
   endpoint accepts. Leave `GOAL` as is or change it if the campaign target
   changes.

   The `Counter` Durable Object needs no separate creation step: the
   `durable_objects` binding and `migrations` block already in
   `wrangler.jsonc` provision it automatically on first deploy. There is no
   KV namespace to create.

2. Deploy:

   ```sh
   cd workers
   npx wrangler deploy
   ```

   Wrangler prints the deployed URL, something like
   `https://shitster-counter.<your-subdomain>.workers.dev`. The count starts
   at 0; it lives entirely in the Durable Object's own storage.

## Point the site at it

The site defaults to reading `/counter.json`, a static file, so it works
with no configuration. To use the live worker instead, `window.
SHITSTER_COUNTER_URL` must be set to the deployed worker URL, and it must be
set on **every page that reads or bumps the counter**, not just the landing
page: `index.html` and `bmw.html` at minimum (both read and bump the
counter), and all five pages for safety (`why.html`, `optout.html`, and
`congress.html` load the same shared module and will silently fall back to
the static file if the global is missing on any one of them). A per-page
global set in only one HTML file does not carry over to the others; each
page loads it independently.

Two ways to do this:

**Simplest: paste this snippet into every built HTML file**, right before
the page's `<script type="module" src="...">` tag:

```html
<script>
  window.SHITSTER_COUNTER_URL = 'https://shitster-counter.<your-subdomain>.workers.dev'
</script>
```

That means editing `index.html`, `bmw.html`, `optout.html`, `congress.html`,
and `why.html` identically (or their equivalents in `dist/` post-build) and
keeping all five in sync by hand whenever the worker URL changes.

**Recommended: a build-time define instead of five hand-edited files.** Set
an environment variable (for example `VITE_COUNTER_URL`) in your deploy
environment and read it once via Vite's `define` in `vite.config.js`, or
reference `import.meta.env.VITE_COUNTER_URL` from `src/shared/ui.js` and set
`window.SHITSTER_COUNTER_URL` from that at module load, before `fetchCount()`
and `bumpCount()` are ever called. That way every page gets the same value
automatically from one source, a rebuild picks up a changed URL, and there
is nothing to keep in sync by hand across five HTML files.

`fetchCount()` and `bumpCount()` in `src/shared/ui.js` read
`window.SHITSTER_COUNTER_URL` and fall back to `/counter.json` (read-only)
when it is not set. No rebuild is required to switch between the static file
and the live worker if you use the snippet approach; the define approach
requires a rebuild whenever the URL changes.

## What it stores

- `count`: a plain integer, the running total, in the `Counter` Durable
  Object's own storage.
- `rl:<sha256 of the request IP>`: a rate-limit timestamp (milliseconds
  since epoch, the last successful increment), in the same Durable Object's
  storage. The raw IP address is never written, only a SHA-256 hash of it.
  These entries are not kept forever: a recurring Durable Object alarm
  sweeps hourly and deletes every entry whose one-hour rate-limit window
  has passed (paginated, so the sweep survives busy hours), so retention
  of even the hashed value is bounded to roughly the rate-limit window.

Nothing else. No names, no emails, no request bodies, no analytics.
