import { BRAND } from './brand.js'

// Injects the shared nav and footer. Every page calls mountChrome() first.
export function mountChrome() {
  const nav = document.createElement('nav')
  nav.className = 'site'
  nav.innerHTML = `
    <span class="wordmark">${BRAND.campaign}</span>
    <a href="bmw.html">BMW notice</a>
    <a href="optout.html">opt-out</a>
    <a href="congress.html">congress</a>
    <a href="why.html">why</a>
  `
  document.body.prepend(nav)

  const footer = document.createElement('footer')
  footer.className = 'site'
  footer.innerHTML = `
    <p>${BRAND.footer}. Open source: <a href="${BRAND.repoUrl}">github</a>.
    Nothing on this site is legal advice. These are self-help templates.
    You act in your own name, at your own judgment, for your own claim.</p>
  `
  document.body.append(footer)

  const rantbar = document.createElement('div')
  rantbar.className = 'rantbar'
  rantbar.textContent = "I'm not a lawyer, not legal advice, just a personal rant. DashOff or fuck off."
  document.body.append(rantbar)
}

// Triggers a browser download of in-memory bytes via a temporary object URL.
// Used by every tool that generates a client-side PDF (bmw, optout,
// congress), factored into one place so they cannot drift out of sync on
// this again. Revoking the object URL is deferred with setTimeout rather
// than called right after a.click(): revoking in the same task as the click
// is a documented cross-browser failure mode (Firefox especially) where the
// download can be silently cancelled or land as a 0-byte file.
export function downloadBlob(bytes, filename, mimeType = 'application/pdf') {
  const blob = new Blob([bytes], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

// Pledge counter. Reads a static JSON by default; a deployed Worker endpoint
// can be swapped in via window.SHITSTER_COUNTER_URL without a rebuild.
// window.SHITSTER_COUNTER_URL is a per-page global, not a site-wide one: it
// must be set on every page that calls fetchCount() or bumpCount() (every
// page does, via mountChrome()'s callers), or that page silently falls back
// to the static /counter.json instead of the live worker. See
// workers/README.md for the copy-paste snippet (needed on all five pages)
// and the recommended build-time-define alternative.
export async function fetchCount() {
  const url = window.SHITSTER_COUNTER_URL || 'counter.json'
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(String(res.status))
    const data = await res.json()
    return Number(data.count) || 0
  } catch {
    return null
  }
}

// Increments the pledge counter after a user successfully generates a
// document. Only does anything when window.SHITSTER_COUNTER_URL is set to
// a deployed workers/counter.js endpoint (see there for the POST contract);
// with the default static /counter.json there is nowhere to write an
// increment to, so this is a no-op and callers should not await UI on it.
// Failures (network, rate limit) are swallowed: this is a nice-to-have
// tally, never a blocker for the tool's actual job.
export async function bumpCount() {
  const url = window.SHITSTER_COUNTER_URL
  if (!url) return null
  try {
    const res = await fetch(url, { method: 'POST' })
    if (!res.ok) return null
    const data = await res.json()
    return Number(data.count) || null
  } catch {
    return null
  }
}
