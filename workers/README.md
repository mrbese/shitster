# DashOff pledge counter (Cloudflare Worker)

Backs the "N notices generated. Goal 5,000." line on the landing page. It is
entirely optional. The site ships with a static `/counter.json` and works
with zero infrastructure; deploy this only if you want a real, live count.

The worker is plain JavaScript with no dependencies. GET returns the count,
POST increments it once per IP per hour (KV-backed rate limit), and no
request body or personal data is ever read or stored.

## Storage: Durable Object for the count, KV for rate limiting

The running total lives in a Durable Object (the `Counter` class in
`counter.js`), not KV. Earlier this worker kept the count in KV too, as a
plain `get('count')` / `+1` / `put('count')`. KV is eventually consistent
and has no compare-and-swap, so two increments landing on different colos at
the same moment could both read the same starting value and only one write
would stick, silently dropping the other, worst of all during the traffic
spikes when the count matters most. A Durable Object instance handles one
request at a time, so the same read-modify-write against its own storage is
atomic for free, no locking or CAS needed. All requests are routed to a
single named instance (`idFromName('global')`) so every increment goes
through the same serialized queue.

KV remains exactly right for the per-IP rate-limit marker: it is a
TTL'd, per-key value with no ordering requirement across requests, which is
what KV is built for. Only that marker lives in KV now.

## Deploy

Requires a Cloudflare account and the `wrangler` CLI (`npm install -g
wrangler`, or use `npx wrangler`).

1. Create the KV namespace (still used for the rate-limit marker):

   ```sh
   npx wrangler kv namespace create COUNTER
   ```

   Copy the `id` it prints into `wrangler.jsonc`, replacing
   `REPLACE_WITH_YOUR_KV_NAMESPACE_ID`.

   The `Counter` Durable Object needs no separate creation step: the
   `durable_objects` binding and `migrations` block already in
   `wrangler.jsonc` provision it automatically on first deploy.

2. Set `SITE_ORIGIN` in `wrangler.jsonc` to the exact origin your site is
   deployed at, for example `"https://dashoff.org"`. This is the only origin
   the worker will answer CORS requests from. Leave `GOAL` as is or change
   it if the campaign target changes.

3. Deploy:

   ```sh
   cd workers
   npx wrangler deploy
   ```

   Wrangler prints the deployed URL, something like
   `https://shitster-counter.<your-subdomain>.workers.dev`. The count starts
   at 0; there is no separate seeding step now that it lives in the Durable
   Object (previously seeded via `wrangler kv key put`).

## Point the site at it

The site defaults to reading `/counter.json`, a static file, so it works
with no configuration. To use the live worker instead, set one line before
the site's scripts load, wherever the site is hosted (for example, a small
inline `<script>` in the deployed `index.html`, or an environment-specific
build step):

```html
<script>
  window.SHITSTER_COUNTER_URL = 'https://shitster-counter.<your-subdomain>.workers.dev'
</script>
```

`fetchCount()` in `src/shared/ui.js` reads that global if it is set, and
falls back to `/counter.json` if it is not. No rebuild is required to switch
between the static file and the live worker.

## What it stores

- `count`: a plain integer, the running total, in the `Counter` Durable
  Object's own storage.
- `ip:<sha256 of the request IP>`: a rate-limit marker with a one-hour TTL,
  in KV. The raw IP address is never written, only a SHA-256 hash of it, and
  only for the duration of the rate-limit window.

Nothing else. No names, no emails, no request bodies, no analytics.
