# SPEC: BMW notice-of-dispute generator (owns: bmw.html body, src/bmw/**)

Read SPEC-SHARED.md first. You own only `bmw.html` and files under `src/bmw/`.

## Page flow (single page, three steps shown progressively)

1. **Explain** (short): what a Section 30.A notice of dispute is, what happens after
   (BMW must hold an individual phone or video conference within 30 days of receipt;
   if unresolved 60 days after the notice is sent, you may file with AAA or small claims).
   Show the pledge counter via `fetchCount()` ("N owners have generated a notice. Goal 5,000.").
2. **Form**: full name, street address, city/state/zip, email, phone, VIN (17 chars,
   validate format `[A-HJ-NPR-Z0-9]{17}`, no I/O/Q), date the ad first appeared
   (date input, default 2026-07-27, min 2026-07-27 max 2026-08-10), ownership type
   (own / lease), state of residence (select, 50 states + DC), amount in dispute in USD
   (number, default 100, helper text: "a good-faith estimate; Section 30.A requires a
   specific number. Many owners use the Section 29.d liability figure of $100."),
   and a free-text personal statement textarea labeled:
   "In your own words: what happened and why you object. Your words, not ours.
   This is the part BMW's lawyers cannot call a form letter."
3. **Generate**: client-side PDF via pdf-lib (import from 'pdf-lib'). Letter-size,
   1-inch margins, embedded standard fonts (Helvetica or TimesRoman). Filename:
   `notice-of-dispute-bmw-<lastname>.pdf`. Also a "print instructions" section after
   download: send by USPS Certified Mail, Return Receipt Requested, to the Section 37
   address; keep the receipt; expect contact within 30 days of delivery; links to
   mailform.io, sendcertifiedmail.com, letterstream.com described as independent
   USPS-integrated services the user pays and uses under their own account.

No data leaves the browser. State lives in memory only. Explicitly no localStorage
for PII. The pledge counter fetch carries no user data.

## The letter (fixed skeleton, fill placeholders; do not paraphrase)

---
[Date]

VIA USPS CERTIFIED MAIL, RETURN RECEIPT REQUESTED

BMW of North America, LLC
Attn: Customer Relations
200 BMW Drive
Woodcliff Lake, NJ 07677

RE: NOTICE OF DISPUTE UNDER SECTION 30.A OF THE BMW CONNECTEDDRIVE TERMS (REV. 2026-01-01)

To BMW of North America, LLC:

I am a BMW owner and ConnectedDrive user. I submit this Notice of Dispute pursuant
to Section 30.A of the BMW ConnectedDrive Terms (Rev. 2026-01-01) (the "Terms").
I am represented by no counsel and proceed individually.

CLAIMANT IDENTITY
Name: [name]
Address: [street], [city], [state] [zip]
Email: [email]  Phone: [phone]
Vehicle Identification Number: [vin]
Vehicle relationship: [owner/lessee]

DESCRIPTION OF THE DISPUTE AND LEGAL CLAIMS
On or about [ad date], BMW NA delivered third-party promotional content (an
advertisement for the Sony Pictures film "Spider-Man: Brand New Day") to the
Control Display of my vehicle. Section 33 of the Terms authorizes dashboard
communications concerning "Services, trials, expirations, renewals, or other
messages, as applicable," that is, matters related to the Services. A third-party
motion picture promotion is not such a matter. Nor is it "relevant in-car or in-app
information" within any reasonable reading of Section 31.c. BMW NA has also
publicly described the Control Display as a private space that would not become
an advertising surface. Delivering paid third-party advertising to the primary
control interface of a vehicle I [own/lease] therefore gives rise to the following
individual claims: (1) breach of contract, including breach of the implied covenant
of good faith and fair dealing, under the Terms; and (2) unlawful and deceptive
commercial practices under the New Jersey Consumer Fraud Act, N.J.S.A. 56:8-1
et seq., and/or the consumer protection statute of my state of residence, [state].

STATEMENT IN MY OWN WORDS
[personal statement]

GOOD-FAITH CALCULATION OF THE AMOUNT IN DISPUTE
[amount] USD, together with an end to the conduct described above.

REQUEST FOR PRE-ARBITRATION INFORMAL DISPUTE RESOLUTION
Pursuant to Section 30.A, I request the individual Pre-Arbitration Informal Dispute
Resolution conference, by telephone or videoconference, within 30 days after your
receipt of this notice. I note that under Section 30.A this conference is individual
to me. Please contact me at the email or phone number above to schedule it. If the
claims described here are not resolved within 60 days after this notice is sent,
I reserve all rights under Section 30.A, including arbitration before the American
Arbitration Association and any right to proceed in small claims court.

Signed,

[name]
Date: [date]
---

Render the user's typed name in a script-style placement above a signature line
(pdf-lib standard fonts only; a labeled signature line with the typed name below it
and the note "sign by hand before mailing").

## Acceptance criteria

- `npm run build` passes; page works from `dist/` output with no network calls
  except `/counter.json`.
- PDF downloads with all placeholders filled, no "[" left in output, wraps long
  personal statements across pages correctly.
- VIN validation rejects I/O/Q and wrong lengths with a plain-English error.
- Disclaimer block present. No em dashes anywhere. One-year deadline (Section 29.f)
  mentioned in the explain step.
