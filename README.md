# shitster

**DashOff.** My car is not your billboard.

## What this is

Between July 27 and August 10, 2026, BMW delivered a full-screen promotional
banner for the Sony Pictures film "Spider-Man: Brand New Day" to the iDrive
Control Display of customer vehicles, cars people already own or lease,
running OS 7 through X, built after July 2020. BMW had previously and
publicly described that display as a private space, one that would not
become an advertising surface. The ConnectedDrive Terms those owners signed
require any dispute to go through individual arbitration, and they ban class
actions. What they do not ban is 5,000 individual owners each sending their
own individual notice, which the Terms already guarantee each of them a
personal hearing on. `shitster` builds the tools to do that: a notice of
dispute generator, an arbitration opt-out tool for people still inside the
30-day window, and a letter and call-script generator aimed at Congress.
Everything happens in your browser. Nothing is filed, sent, or stored on
your behalf.

## The three tools

- **`/bmw.html`, notice of dispute.** Walks through Section 30.A of the
  ConnectedDrive Terms, then generates a ready-to-print notice of
  dispute PDF addressed to BMW's Customer Relations office, with your own
  free-text statement of what happened, in your own words. You print and sign it.
- **`/optout.html`, arbitration opt-out.** For owners still inside the
  30-day window under Section 30.B. Computes your exact postmark deadline
  from the date you first accepted a BMW arbitration provision, and
  generates a ready-to-print opt-out letter for you to sign. Tells you plainly when that window has
  already closed instead of pretending otherwise.
- **`/congress.html`, tell Congress.** Looks up your representative and two
  senators from a vendored public dataset, and generates a call script, a
  copy-paste webform letter, and a printable PDF letter asking them to
  cosponsor the FAIR Act, the bill that would make clauses like Section 30
  unenforceable in consumer contracts in the first place.

Every tool page also carries `/why.html`, a plain explanation of the legal
and procedural argument this whole project rests on.

## The legal architecture, in plain English

This project does not try to beat BMW's arbitration clause. It uses it.

- **Why notices, not lawsuits.** Section 30.A of the ConnectedDrive Terms
  (Rev. 2026-01-01) requires that before arbitration, a party send a
  completed notice of dispute by certified mail, then hold an individual
  Pre-Arbitration Informal Dispute Resolution conference by phone or
  videoconference, and it explicitly bars multiple people from sharing one
  conference. That is a real, contractual, individual right, and it costs
  BMW real scheduling capacity per person who exercises it.
- **Why not mass arbitration.** Section 30.C waives claims brought as a
  mass action of 50 or more substantially similar demands filed through the
  same firm within 180 days, and Section 30.D lets BMW batch arbitration
  demands 100 to a batch, one set of filing fees per batch. Those provisions
  govern arbitration demands, not Section 30.A notices, which is exactly why
  this project stops at the notice stage. Filing en masse plays into the
  discount BMW built for itself. Sending individually does not.
- **Publisher, not administrator.** This site generates documents. It does
  not file them, submit them to AAA or any court, track their status,
  schedule anything, or coordinate claims across users. The BMW tool ends
  at the notice stage, with neutral links to AAA's consumer filing page and
  small-claims resources, described plainly as "decide for yourself"
  options. No feature here automates a call, auto-submits to a government
  or corporate system, or algorithmically varies legal language to make
  letters look different from one another. The only thing that varies
  letter to letter is what you write in your own words.

Section citations above are to the source terms, committed at
`docs/bmw-connecteddrive-terms-us-rev-2026-01-01.pdf`. Read `/why.html` for
the fuller argument, including the two federal cases (`Heckman v. Live
Nation Entertainment`, `MacClelland v. Cellco Partnership`) that have
started to notice this same one-sided-aggregation pattern elsewhere.

## Technical architecture

- **Static, client-side site.** Plain HTML entry points (`index.html`,
  `bmw.html`, `optout.html`, `congress.html`, `why.html`), each rendering
  its content into `<main id="app">` via a matching ES module. No framework,
  no build-time server, no backend required to run it.
- **Client-side PDF generation.** All letters are built in the browser with
  [`pdf-lib`](https://github.com/Hopding/pdf-lib), using standard embedded
  fonts. Nothing you type is transmitted anywhere to produce a document.
- **Data-minimizing design.** Form state lives in page memory only, never in
  `localStorage` or a cookie, and is discarded on reload. The only network
  calls the tools make are to the US Census geocoder (only when you explicitly
  submit an address for the optional district lookup) and the pledge counter.
  The counter carries no form data. The congressional dataset is bundled with
  the site. Your name, contact fields, letter contents, and generated PDFs are
  not transmitted.
- **Vendored civic data.** `/congress.html` resolves your representative and
  senators from a committed snapshot of the public-domain
  `unitedstates/congress-legislators` dataset, so the tool works without a
  live API dependency for the data itself. See `data/README.md` for the
  source and how to refresh it.
- **Optional Cloudflare Worker.** The "N notices generated" counter reads a
  static `/counter.json` by default, so the whole site works with zero
  infrastructure. `workers/counter.js` is a complete, deployable Worker that
  can back it live instead, with per-IP rate limiting and no stored PII.
  See `workers/README.md` to deploy it. Deploying it is optional and
  nothing in this repo does it for you.

## Local dev

```sh
npm install
npm run dev
```

Then open the printed local URL. `npm run build` produces a static `dist/`
you can host anywhere; `npm run preview` serves that build locally.

## Deploy notes

This is a static site once built. Any static host works: Cloudflare Pages,
Netlify, Vercel, GitHub Pages, or a plain object storage bucket behind a
CDN. Run `npm run build` and upload the contents of `dist/`. If you want the
live pledge counter instead of the static `/counter.json`, deploy
`workers/counter.js` separately (see `workers/README.md`) and set
`window.SHITSTER_COUNTER_URL` on the deployed site, on every page that reads
or bumps the counter (`index.html` and `bmw.html` at minimum, all five for
safety), not just the landing page. See `workers/README.md` for a copy-paste
snippet and a recommended build-time-define alternative.

## Contributing

Issues and pull requests are welcome. If you are changing copy, keep it
factual, plain, and free of hype, no exclamation marks, no em dashes. If you
are touching a tool's legal text, do not paraphrase the fixed letter
skeletons; the only text that should vary between users is their own
free-text statement. If you are adding a new jurisdiction or a new company's
terms, start from `specs/SPEC-SHARED.md`'s FACTS section as the model for
how facts and citations should be recorded and sourced.

## License

MIT. See `LICENSE`. Copyright shitster contributors.

## FAQ

**Is this legal advice?**
No. Every tool page carries a disclaimer to that effect. These are self-help
templates, not legal advice, and using them does not create an
attorney-client relationship with anyone. You act individually, in your own
name, at your own judgment. If your situation is unusual, talk to a lawyer.

**Why is it called shitster?**
Because being angry and being precise are not mutually exclusive.

**Does this send anything on my behalf?**
No. Nothing here files, submits, tracks, schedules, or transmits anything
for you. Every document is generated in your browser and downloaded to your
device. You print it, sign it, and mail it, or you place the call, yourself.
The tool prepares, the human acts.

**Does this store what I type?**
No. There is no backend for form data, no `localStorage` use for personal
information, and no analytics or cookies anywhere on the site. Close the tab
and it is gone.
