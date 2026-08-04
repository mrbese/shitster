// Reads the vendored legislators-current.json snapshot (data/README.md has the
// source and refresh command) and resolves state/district into members.
//
// The snapshot is fetched at lookup time rather than statically imported: a
// static `import raw from ...json` makes Vite inline the whole 1.4 MB file
// into the page's JS bundle (see data/README.md), so every visitor pays for
// and parses all 537 members before the page can render, even though a
// single lookup only ever needs one state's entries. The file lives in
// public/ instead so it is served as a plain static asset and fetched lazily
// on first use, cached in-memory for the rest of the session.
let rawPromise = null

function loadRaw() {
  if (!rawPromise) {
    rawPromise = fetch('legislators-current.json')
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load legislator data (${res.status}).`)
        return res.json()
      })
      .catch((err) => {
        // A rejected promise would otherwise be cached forever: every later
        // call would immediately re-reject with the same stale error and the
        // module would never retry the fetch. Null it out so the next call
        // starts a fresh fetch.
        rawPromise = null
        throw err
      })
  }
  return rawPromise
}

export const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
  IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan',
  MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana',
  NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota',
  TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia',
  WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  AS: 'American Samoa', GU: 'Guam', MP: 'Northern Mariana Islands',
  PR: 'Puerto Rico', VI: 'U.S. Virgin Islands'
}

// Territories and DC: a non-voting delegate (or, for Puerto Rico, a Resident
// Commissioner) in the House, and no U.S. Senators.
const NO_SENATE = new Set(['DC', 'AS', 'GU', 'MP', 'VI', 'PR'])

function currentTerm(member) {
  return member.terms[member.terms.length - 1]
}

export function hasSenators(state) {
  return !NO_SENATE.has(state)
}

export function memberTitle(state, type) {
  if (type === 'sen') return 'Senator'
  if (state === 'PR') return 'Resident Commissioner'
  if (NO_SENATE.has(state)) return 'Delegate'
  return 'Representative'
}

export function allStateCodes() {
  return Object.keys(STATE_NAMES)
}

// Distinct, sorted district numbers this state currently has representation
// for. At-large states and territories/DC use district 0; that shows up here
// as a single-element [0].
export async function districtsForState(state) {
  const raw = await loadRaw()
  const set = new Set()
  for (const m of raw) {
    const t = currentTerm(m)
    if (t.type === 'rep' && t.state === state) set.add(t.district)
  }
  return [...set].sort((a, b) => a - b)
}

export async function senatorsFor(state) {
  const raw = await loadRaw()
  const rank = { senior: 0, junior: 1 }
  return raw
    .filter((m) => {
      const t = currentTerm(m)
      return t.type === 'sen' && t.state === state
    })
    .map((m) => ({ member: m, term: currentTerm(m) }))
    .sort((a, b) => {
      const ra = rank[a.term.state_rank] ?? 2
      const rb = rank[b.term.state_rank] ?? 2
      if (ra !== rb) return ra - rb
      return (a.member.name.last || '').localeCompare(b.member.name.last || '')
    })
}

// Looks up the representative for state+district. Falls back to district 0
// (the dataset's convention for at-large seats and non-voting delegates) so a
// stray or unexpected district code from the geocoder still resolves.
export async function representativeFor(state, district) {
  const raw = await loadRaw()
  const inState = raw.filter((m) => {
    const t = currentTerm(m)
    return t.type === 'rep' && t.state === state
  })
  let match = inState.find((m) => currentTerm(m).district === district)
  if (!match) match = inState.find((m) => currentTerm(m).district === 0)
  if (!match && inState.length === 1) match = inState[0]
  return match ? { member: match, term: currentTerm(match) } : null
}

export function displayName(member) {
  return member.name.official_full || `${member.name.first} ${member.name.last}`
}
