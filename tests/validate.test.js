import { describe, expect, it } from 'vitest'
import {
  findUnsupportedPdfChars,
  normalizeVin,
  validateAdDate,
  validateAmount,
  validateVin
} from '../src/bmw/validate.js'

describe('BMW form validation', () => {
  it('normalizes and validates a VIN while rejecting forbidden letters', () => {
    expect(normalizeVin(' wbaxy7c05m9d12345 ')).toBe('WBAXY7C05M9D12345')
    expect(validateVin('WBAXY7C05M9D12345')).toBeNull()
    expect(validateVin('WBAXY7C05M9O12345')).toContain('never the letters I, O, or Q')
  })

  it('accepts only dates inside the documented campaign window', () => {
    expect(validateAdDate('2026-07-27')).toBeNull()
    expect(validateAdDate('2026-08-10')).toBeNull()
    expect(validateAdDate('2026-08-11')).toContain('between July 27 and August 10')
  })

  it('requires a finite positive dispute amount', () => {
    expect(validateAmount('100')).toBeNull()
    expect(validateAmount('0')).toContain('greater than zero')
    expect(validateAmount('not-a-number')).toContain('greater than zero')
  })

  it('reports unsupported PDF characters without duplicate entries', () => {
    expect(findUnsupportedPdfChars('plain café text')).toEqual([])
    expect(findUnsupportedPdfChars('emoji 😀 and another 😀')).toEqual(['😀'])
  })
})
