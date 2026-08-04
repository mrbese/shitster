// Static U.S. House apportionment, independent of the vendored legislators
// snapshot (see data/README.md). Based on the 2020 census, in effect for the
// 118th and 119th Congresses (2023-2033).
//
// The district picker must derive its list of districts from this table,
// not from who currently holds each seat: a seat between representatives
// (a vacancy) still has a district number, and deriving the picker from
// serving members alone silently drops those districts from the list. In
// the vendored snapshot this repo ships with, that currently affects
// CA-14, FL-20, GA-13, and TX-23.
export const APPORTIONMENT = {
  AL: 7, AK: 1, AZ: 9, AR: 4, CA: 52, CO: 8, CT: 5, DE: 1, FL: 28, GA: 14,
  HI: 2, ID: 2, IL: 17, IN: 9, IA: 4, KS: 4, KY: 6, LA: 6, ME: 2, MD: 8,
  MA: 9, MI: 13, MN: 8, MS: 4, MO: 8, MT: 2, NE: 3, NV: 4, NH: 2, NJ: 12,
  NM: 3, NY: 26, NC: 14, ND: 1, OH: 15, OK: 5, OR: 6, PA: 17, RI: 2, SC: 7,
  SD: 1, TN: 9, TX: 38, UT: 4, VT: 1, VA: 11, WA: 10, WV: 2, WI: 8, WY: 1
}

// DC and the territories: one non-voting delegate each (Puerto Rico elects a
// Resident Commissioner instead of a delegate), no U.S. Senators, and the
// vendored dataset's convention of district 0 for that single seat.
export const DELEGATE_JURISDICTIONS = ['DC', 'AS', 'GU', 'MP', 'PR', 'VI']

// The district numbers a state or jurisdiction has, independent of whether
// anyone currently holds each seat. States with a single seat use the
// dataset's at-large convention, district 0, rather than "district 1".
// Returns [] for anything not in either table.
export function districtNumbersForState(state) {
  if (state in APPORTIONMENT) {
    const seats = APPORTIONMENT[state]
    if (seats <= 1) return [0]
    return Array.from({ length: seats }, (_, i) => i + 1)
  }
  if (DELEGATE_JURISDICTIONS.includes(state)) return [0]
  return []
}
