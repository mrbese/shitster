// US Census geocoder lookup. This is the one runtime network call this page
// makes, and it carries only the address string the user typed, nothing else.
// The Census geocoder does not send CORS headers, so the direct call fails in
// most browsers; callers should catch and fall back to the manual state and
// district picker.

const GEOCODER_URL = 'https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress'

export class GeocodeError extends Error {}

// Returns { state, district, city, zip, matchedAddress } or null if the
// address had no match. Throws GeocodeError on network/CORS failure or an
// unparseable response, which callers should treat as "use the fallback."
export async function geocodeAddress(address) {
  const url = `${GEOCODER_URL}?address=${encodeURIComponent(address)}&benchmark=Public_AR_Current&vintage=Current_Current&layers=all&format=json`
  let res
  try {
    res = await fetch(url)
  } catch (err) {
    throw new GeocodeError(
      'The Census geocoder does not allow browser-based lookups from other sites (it sends no CORS headers), so this call was blocked by your browser.'
    )
  }
  if (!res.ok) throw new GeocodeError(`Census geocoder returned ${res.status}.`)

  let data
  try {
    data = await res.json()
  } catch (err) {
    throw new GeocodeError('Census geocoder returned an unreadable response.')
  }

  const matches = data && data.result && data.result.addressMatches
  if (!matches || matches.length === 0) return null

  const match = matches[0]
  const geos = match.geographies || {}
  const statesLayer = geos['States']
  if (!statesLayer || !statesLayer[0] || !statesLayer[0].STUSAB) {
    throw new GeocodeError('Census geocoder response did not include a state.')
  }
  const state = statesLayer[0].STUSAB

  // The congressional-district layer name embeds the Congress number (for
  // example "119th Congressional Districts"), so match by suffix instead of
  // hardcoding a session number that will go stale.
  const cdKey = Object.keys(geos).find((k) => /Congressional Districts$/.test(k))
  let district = null
  if (cdKey && geos[cdKey] && geos[cdKey][0]) {
    const entry = geos[cdKey][0]
    const cdField = Object.keys(entry).find((k) => /^CD\d+$/.test(k))
    if (cdField) {
      const parsed = parseInt(entry[cdField], 10)
      if (!Number.isNaN(parsed)) district = parsed
    }
  }

  const comp = match.addressComponents || {}
  const titleCase = (s) =>
    typeof s === 'string'
      ? s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
      : ''

  return {
    state,
    district,
    city: titleCase(comp.city),
    zip: comp.zip || '',
    matchedAddress: match.matchedAddress || ''
  }
}
