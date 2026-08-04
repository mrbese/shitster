# SPEC: Congress tool (owns: congress.html body, src/congress/**, data/**)

Read SPEC-SHARED.md first. You own `congress.html`, `src/congress/`, and `data/`.

## Purpose

Address in, your two senators and one representative out, with three actions:
call script, webform letter to copy-paste, and a printable PDF letter addressed to
the member's DISTRICT office (not the Capitol; Capitol mail is security-screened and
slow). The ask: cosponsor the FAIR Act (Forced Arbitration Injustice Repeal Act),
which would make pre-dispute arbitration clauses unenforceable in consumer contracts.

## Data

- Vendor a snapshot: download
  https://unitedstates.github.io/congress-legislators/legislators-current.json
  into `data/legislators-current.json` at build time (check it into the repo; it is
  public-domain data, a few MB). Write `data/README.md` noting the source and that
  it is a point-in-time snapshot with an update command.
- District lookup: US Census geocoder,
  `https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress?address=<addr>&benchmark=Public_AR_Current&vintage=Current_Current&layers=all&format=json`.
  Parse the current congressional district from the response. Handle CORS pragmatically:
  try the direct call; if it fails, show a graceful fallback where the user selects
  their state and district manually (link to house.gov/representatives/find-your-representative
  so they can look it up). Do not add any third-party API with keys.
- From state+district, resolve the representative; from state, the two senators.
  Show name, party, phone (from the dataset's terms[].phone), webform URL
  (terms[].contact_form or the member's official website), and district office guidance.

## Letter and script content (fixed skeleton)

Call script (short, 30 seconds, includes a [blank] for the caller's own reason):
"Hi, my name is [name], I'm a constituent from [city]. I'm calling to ask
[Senator/Representative] [last name] to cosponsor the FAIR Act, which ends forced
arbitration in consumer contracts. Companies put clauses in contracts nobody can
negotiate that erase the right to go to court, and recently they've added rules
that make their liability shrink as the number of people they harm grows. It
matters to me because [blank]. Congress carved out sexual assault claims in 2022,
so it can do this. Will the [Senator/Representative] cosponsor? Thank you."

Letter (printable PDF via pdf-lib, and a copy-to-clipboard plain text version for
webforms): formal, one page, same core argument, with a clearly labeled
"In my own words" paragraph from a free-text field. Same PDF quality bar as the
BMW tool. Address block uses the member's name; instruct the user to send to the
nearest district office listed on the member's official website.

## Acceptance criteria

- Works fully client-side against the vendored JSON (the only runtime network call
  is the Census geocoder, with the manual state/district fallback if it fails).
- No user data leaves the browser except the address string sent to the Census
  geocoder, and the page says exactly that before the user submits the lookup.
- Handles: DC/territories (delegate, no senators; say so plainly), at-large states,
  addresses the geocoder cannot resolve.
- Disclaimer block present, no em dashes, `npm run build` passes.
