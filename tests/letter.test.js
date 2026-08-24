import { describe, expect, it } from 'vitest'
import { BLANK, buildLetterModel, noticeFileStem } from '../src/bmw/letter.js'

const FILLED = {
  fullName: 'Jane Doe',
  street: '1 Main St',
  city: 'Springfield',
  addressState: 'IL',
  zip: '62701',
  email: 'jane@example.test',
  phone: '2175551212',
  vin: 'wbaxy7c05m9d12345',
  adDateValue: '2026-07-27',
  ownership: 'lease',
  residenceStateName: 'Illinois',
  amount: '250',
  personalStatement: 'This happened to me and I object.'
}

describe('buildLetterModel with every field filled', () => {
  const letter = buildLetterModel(FILLED)

  it('uppercases the VIN in the claimant identity block', () => {
    expect(letter.claimantIdentity.lines.join('\n')).toContain('WBAXY7C05M9D12345')
  })

  it('reflects lease ownership in the identity and dispute sections', () => {
    expect(letter.claimantIdentity.lines.join('\n')).toContain('Vehicle relationship: Lessee')
    expect(letter.dispute.paragraph).toContain('a vehicle I lease')
  })

  it('renders the typed amount and personal statement verbatim', () => {
    expect(letter.amount.paragraph).toContain('250.00 USD')
    expect(letter.statement.lines).toEqual(['This happened to me and I object.'])
  })

  it('never leaves the fixed skeleton text unset', () => {
    expect(letter.reLine).toContain('SECTION 30.A')
    expect(letter.dispute.paragraph).toContain('advertising')
  })
})

describe('buildLetterModel with every field blank', () => {
  const blank = {
    fullName: '', street: '', city: '', addressState: '', zip: '',
    email: '', phone: '', vin: '', adDateValue: '', ownership: '',
    residenceStateName: '', amount: '', personalStatement: ''
  }
  const letter = buildLetterModel(blank)

  it('fills every blank claimant identity field with a blank line', () => {
    for (const line of letter.claimantIdentity.lines.slice(0, 4)) {
      expect(line).toContain(BLANK)
    }
  })

  it('falls back to "Owner" (never blank) and blanks the ad date and amount', () => {
    expect(letter.claimantIdentity.lines[4]).toBe('Vehicle relationship: Owner')
    expect(letter.dispute.paragraph).toContain(`On or about ${BLANK}`)
    expect(letter.amount.paragraph).toContain(`${BLANK} USD`)
  })

  it('gives the personal statement several blank lines instead of placeholder prose', () => {
    expect(letter.statement.lines.length).toBeGreaterThan(1)
    for (const line of letter.statement.lines) expect(line).toBe(BLANK)
  })

  it('still emits the fixed skeleton text untouched', () => {
    expect(letter.reLine).toContain('SECTION 30.A')
    expect(letter.request.paragraph).toContain('American Arbitration Association')
  })
})

describe('noticeFileStem', () => {
  it('uses the last name, lowercased and stripped of punctuation', () => {
    expect(noticeFileStem("Jane O'Doe-Smith")).toBe('odoesmith')
  })

  it('falls back to "notice" when the name is blank', () => {
    expect(noticeFileStem('')).toBe('notice')
    expect(noticeFileStem('   ')).toBe('notice')
  })
})
