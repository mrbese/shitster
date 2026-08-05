# SPEC: Landing, opt-out, why page, worker, README
# (owns: index.html body + src/main.js, optout.html body + src/optout/**, why.html body + src/why.js, workers/**, README.md)

Read SPEC-SHARED.md first.

## index.html (src/main.js)

Landing. Structure:
- H1: the tagline from brand.js. Subhead: "BMW put a movie ad on the dashboard of
  cars people own. Their contract bans class actions. It does not ban 5,000
  individual notices. This site helps you send yours."
- Live counter (fetchCount): "N notices generated. Goal 5,000." with a short
  explanation of why the number matters (Section 30.A individual conferences).
- Three cards linking to /bmw.html ("Send BMW a notice of dispute. 10 minutes."),
  /optout.html ("Just bought a BMW? Opt out of arbitration. 30-day window."),
  /congress.html ("Tell Congress to end forced arbitration. 2 minutes.").
- A short "how this works" strip: prepared in your browser, sent by you, stored
  nowhere. The tool prepares, the human acts.

## optout.html (src/optout/)

Short page. Explain Section 30.B plainly, including the hard truth: the window is
30 days from the FIRST BMW agreement with an arbitration clause you ever accepted,
so this is for new owners and first-time activations only, and strict compliance
is required. Form: name, address, phone, email, date of first acceptance
(date input; compute and display the postmark deadline, date + 30 days, prominently;
if already past, say so honestly and point to /bmw.html instead). Generate a short
opt-out letter PDF (pdf-lib) to: BMW of North America, LLC, Attn: Customer Relations,
PO Box 1227, Westwood NJ 07675-1227, stating non-agreement to the Agreement to
Arbitrate, including the four required fields, with a hand-signature line (Section
30.B does not list a signature requirement; recommend signing as a prudent way to
authenticate the letter). Instruct: mail with a postmark before
the deadline, keep proof of mailing.

## why.html (src/why.js)

The philosophy page, static prose, no form. Content (write it well, plain and hard):
1. What happened: Spider-Man ad, July 27 to August 10, 2026, on a display BMW
   called a private space. What the contract already said (Sections 33, 31.c).
2. The three principles, as section headings:
   "Liability should not shrink as harm scales." (explain the 100-per-batch discount)
   "The drafter of the rules cannot be their beneficiary." (unilateral updates,
   the pre-expired opt-out window)
   "Aggregation for me but not for thee is not procedure, it is immunity."
   (class waiver vs mandatory defendant-side batching, Heckman v. Live Nation and
   MacClelland v. Cellco as the courts that noticed)
3. What this site does and refuses to do: publisher not administrator, the human
   acts, no evasion features, no automation aimed at anyone's phone lines.
4. The legislative fix: the FAIR Act, the 2022 sexual assault carve-out as proof
   of possibility, link to /congress.html.

## workers/counter.js + workers/README.md

A complete, deployable Cloudflare Worker (plain JS, no dependencies) backing the
pledge counter: GET returns {count, goal} with CORS for the site origin, POST
increments (no body, no PII) with basic abuse damping (per-IP rate limit via KV
with TTL, e.g. one increment per IP per hour). KV binding COUNTER. Include
wrangler.jsonc and a README with deploy steps and the one-line site config
(window.SHITSTER_COUNTER_URL). Do not deploy anything; code only. The static
/counter.json remains the default so the site works with zero infrastructure.

## README.md (repo root, portfolio quality)

Sections: what this is (one paragraph, the BMW story), the three tools, the legal
architecture in plain English (why notices, why not mass arbitration, publisher not
administrator, with section cites to the terms PDF in docs/), the technical
architecture (client-side pdf-lib, zero-PII design, vendored civic data, optional
worker), local dev (npm install, npm run dev), deploy notes (any static host),
contributing, license note (MIT, and add a LICENSE file, copyright "shitster
contributors"), and a short FAQ including "Is this legal advice?" (no) and
"Why is it called shitster?" (because being angry and being precise are not
mutually exclusive). No em dashes anywhere.
