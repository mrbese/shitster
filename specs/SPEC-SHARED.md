# Shared facts and rules for all shitster modules

Every builder agent must read this file first. Deviating from the FACTS section is a defect.

## Project

- Project umbrella: **shitster**. Campaign name: **DashOff**. Tagline: "My car is not your billboard."
- Import naming from `src/shared/brand.js`. Never hardcode the campaign name in JS.
- Every page starts with `mountChrome()` from `src/shared/ui.js` and renders into `<main id="app">`.
- Design: use only tokens from `src/shared/style.css`. Monochrome plus the single orange accent. No new colors, no gradients, no external fonts, no CDN scripts, no analytics, no cookies. Everything self-contained and client-side.
- Core thesis, repeated where relevant: **the tool prepares, the human acts.** This site never sends, files, stores, or transmits anything on a user's behalf. All document generation happens in the browser. No form field content ever leaves the page.

## Writing rules (hard)

- NO em dashes anywhere in copy. Use periods, commas, parentheses.
- Direct, plain, factual tone. No legalese in UI copy, no hype, no exclamation marks.
- Every tool page carries this disclaimer block (verbatim, in a `.disclaimer` div):
  "This is a self-help template, not legal advice, and no attorney-client relationship exists. You are acting individually, in your own name. Read what you sign. If your situation is unusual, talk to a lawyer."

## FACTS: BMW ConnectedDrive Terms, US, Rev. 2026-01-01

Source PDF is committed at `docs/bmw-connecteddrive-terms-us-rev-2026-01-01.pdf`. Cite sections exactly as follows:

- Section 30.A: before arbitration, a party must send by certified mail a completed form notice of dispute. The parties must then "personally meet and confer, via telephone or videoconference" (Pre-Arbitration Informal Dispute Resolution) within 30 days after the notice is received. "Multiple individuals initiating claims cannot participate in the same informal telephonic dispute resolution conference." If unresolved 60 days after notice is sent, either party may initiate AAA arbitration (AAA Consumer Arbitration Rules). Statute of limitations and filing fee deadlines are tolled during the process. Each claim must set out the claimant's identity, a detailed description of the legal claims, and a good-faith calculation of the specific amount in dispute.
- Section 30.B: arbitration opt-out. Deadline: 30 days from the EARLIER of (1) accepting the Terms or (2) the date the person FIRST agreed to any BMW NA agreement containing an arbitration provision. Postmarked by deadline, mailed to: BMW of North America, LLC, Attn: Customer Relations, PO Box 1227, Westwood NJ 07675-1227. Must state non-agreement to the Agreement to Arbitrate and include name, address, phone number, email. Must be signed by the individual. Strict compliance required. Practical consequence: the window is only open for people who FIRST accepted a BMW arbitration agreement within the last 30 days (new owners/activations).
- Section 30.C: Mass Action Waiver (50+ substantially similar demands via the same law firm or organization within 180 days). Section 30.D: batching, 100 demands per batch, one set of filing fees per batch. These apply to ARBITRATION DEMANDS, not to Section 30.A notices.
- Section 33: BMW may use dashboard communication "to inform you about Services, trials, expirations, renewals, or other messages, as applicable" (matters related to Services).
- Section 31.c: BMW may use collected information to "provide relevant in-car or in-app information, businesses, locations, advertising, and other purposes."
- Section 29.d: aggregate liability of BMW NA and its providers is limited to the greater of (1) the total amount the user paid for the Services in the 12 months preceding the claim or (2) $100.
- Section 29.f: claims must be brought within one year after the claim arises.
- Section 37: notices to BMW NA in writing at: BMW of North America, LLC, Attn: Customer Relations, 200 BMW Drive, Woodcliff Lake, NJ 07677.
- Governing law: New Jersey (Section 41).

## FACTS: the Spider-Man campaign

- Between July 27 and August 10, 2026, BMW delivered a full-screen "Spider-Man: Brand New Day" (Sony Pictures) promotional experience to the iDrive Control Display of customer vehicles (OS 7, 8, 8.5, 9, X; cars built after July 2020), appearing as a banner on vehicle start.
- BMW previously publicly described the Control Display as a "private space" that would not become an advertising surface.
- Framing for claims: the promotion is third-party promotional content, not a matter "related to Services" (Section 33), and outside any reasonable reading of "relevant in-car information" (Section 31.c). Consumer-protection framing: contrast with BMW's prior public statements.
- NEVER claim the ad was undismissable or that BMW charged for it. Facts only: it appeared on the dashboard of cars people own.

## Legal-safety design rules (hard)

- The site is a PUBLISHER of templates, never an ADMINISTRATOR of claims. No feature may file, submit, track, schedule, or coordinate arbitration demands. The BMW tool ends at the notice stage plus neutral links to AAA's consumer filing page and small-claims resources with "decide for yourself" framing.
- No feature may vary or paraphrase legal text algorithmically to make letters look different. Variation comes only from the user's own free-text personal statement, clearly labeled as their own words.
- No AI-generated calls, no auto-submission to any government or corporate system.
