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

- Section 30.A: before arbitration, a party must send by certified mail a completed form notice of dispute. The parties must then "personally meet and confer, via telephone or videoconference" (Pre-Arbitration Informal Dispute Resolution) within 30 days after the notice is RECEIVED. "Multiple individuals initiating claims cannot participate in the same informal telephonic dispute resolution conference." If unresolved 60 days after the notice is SENT, either party may initiate AAA arbitration (AAA Consumer Arbitration Rules). The two clocks have different triggers (receipt vs sending); never describe them as starting together. Statute of limitations and filing fee deadlines are tolled during the process. Each claim must set out the claimant's identity, a detailed description of the legal claims, and a good-faith calculation of the specific amount in dispute.
- Section 30.B: arbitration opt-out. Deadline: 30 days from the EARLIER of (1) accepting the Terms or (2) the date the person FIRST agreed to any BMW NA agreement containing an arbitration provision. Postmarked by deadline, mailed to: BMW of North America, LLC, Attn: Customer Relations, PO Box 1227, Westwood NJ 07675-1227. Must state non-agreement to the Agreement to Arbitrate and include name, address, phone number, email. Strict compliance with those listed contents is required. NOTE: Section 30.B itself does not list a signature requirement (the explicit individual-signature language is in Section 30.C's separate post-mass-action opt-out); recommend a handwritten signature as PRUDENT, never state it as a 30.B requirement. Practical consequence: the window is only open for people who FIRST accepted a BMW arbitration agreement within the last 30 days (new owners/activations).
- Section 30.C: Mass Action Waiver (50+ substantially similar demands via the same law firm or organization within 180 days). Section 30.D: batching, 100 demands per batch, one set of filing fees per batch. These apply to ARBITRATION DEMANDS, not to Section 30.A notices.
- Section 33: BMW may use dashboard communication "to inform you about Services, trials, expirations, renewals, or other messages, as applicable" (matters related to Services). This is the provision that governs what may appear on the dashboard.
- Section 31.c: BMW may use collected information to "provide relevant in-car or in-app information, businesses, locations, advertising, and other purposes." HARD RULE: whenever 31.c is cited or discussed, quote this phrase IN FULL, including the word "advertising". Never truncate it before "advertising"; selective quotation is a credibility defect. The honest argument is: 31.c governs how BMW may USE COLLECTED INFORMATION, it is not a grant of authority over the dashboard display itself (Section 33 is), and no provision authorizes third-party promotional takeovers of the primary control interface.
- Section 28.d (NOT 29.d): aggregate liability of BMW NA and its providers is limited to the greater of (1) the total amount the user paid for the Services in the 12 months preceding the claim or (2) $100.
- Section 28.f (NOT 29.f): claims must be brought within one year after the claim arises.
- Section 29 is the jury trial and class action waiver heading. Never cite 29.d or 29.f; the liability subsections belong to Section 28.
- Section 37: notices to BMW NA in writing at: BMW of North America, LLC, Attn: Customer Relations, 200 BMW Drive, Woodcliff Lake, NJ 07677.
- Governing law: New Jersey (Section 41).

## FACTS: the Spider-Man campaign

- Between July 27 and August 10, 2026, BMW delivered a full-screen "Spider-Man: Brand New Day" (Sony Pictures) promotional experience to the iDrive Control Display of customer vehicles (OS 7, 8, 8.5, 9, X; cars built after July 2020), appearing as a banner on vehicle start.
- BMW's senior vice president for connected experience (Stephan Durach) stated on record in December 2023 that BMW would not sell in-car screen space to play a commercial, calling the car a "private space." Attribute to BMW/its executive, NOT to "BMW NA" specifically (the statement came from BMW Group leadership).
- The campaign ran in more than 70 countries, including Germany and the rest of Europe. EU angle for the why page: regulators mandate third-party access to phones (DMA) but no rule requires automakers to open the infotainment surface, with safety as the stated reason; the same closed-for-safety surface is now monetized. Never claim the EU approved the ads; the claim is the asymmetry.
- Framing for claims: the promotion is third-party promotional content, not a matter "related to Services" (Section 33). When addressing Section 31.c, follow the HARD RULE above: quote it in full and argue scope (use-of-information vs display authority), never pretend the word "advertising" is not there. Consumer-protection framing: contrast with BMW's prior public statements.
- NEVER claim the ad was undismissable, that BMW charged owners for it, or that BMW was PAID for the promotion (a media-value estimate of the Sony campaign does not establish payment to BMW). Say "third-party promotional content" or "a promotional partnership", never "paid advertising". Facts only: it appeared on the dashboard of cars people own.

## Legal-safety design rules (hard)

- The site is a PUBLISHER of templates, never an ADMINISTRATOR of claims. No feature may file, submit, track, schedule, or coordinate arbitration demands. The BMW tool ends at the notice stage plus neutral links to AAA's consumer filing page and small-claims resources with "decide for yourself" framing.
- No feature may vary or paraphrase legal text algorithmically to make letters look different. Variation comes only from the user's own free-text personal statement, clearly labeled as their own words.
- No AI-generated calls, no auto-submission to any government or corporate system.
