import { describe, expect, it } from 'vitest'
import { districtNumbersForState } from '../src/congress/apportionment.js'

describe('districtNumbersForState', () => {
  it('keeps every apportioned district available when a seat is vacant', () => {
    const california = districtNumbersForState('CA')
    expect(california).toHaveLength(52)
    expect(california).toContain(14)
  })

  it('uses district zero for at-large states and delegate jurisdictions', () => {
    expect(districtNumbersForState('AK')).toEqual([0])
    expect(districtNumbersForState('DC')).toEqual([0])
    expect(districtNumbersForState('PR')).toEqual([0])
  })

  it('returns no districts for an unknown code', () => {
    expect(districtNumbersForState('XX')).toEqual([])
  })
})
