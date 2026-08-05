import { describe, expect, it } from 'vitest'
import { escapeHtml, safeHttpUrl, safePhoneUrl } from '../src/shared/safe.js'

describe('escapeHtml', () => {
  it('escapes text and attribute delimiters from external data', () => {
    expect(escapeHtml('<img src=x onerror="alert(1)"> & \'quoted\''))
      .toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;quoted&#39;')
  })
})

describe('safeHttpUrl', () => {
  it('accepts absolute HTTPS and HTTP links', () => {
    expect(safeHttpUrl('https://www.house.gov/contact')).toBe('https://www.house.gov/contact')
    expect(safeHttpUrl('http://example.test/path')).toBe('http://example.test/path')
  })

  it('rejects executable, relative, and malformed links', () => {
    expect(safeHttpUrl('javascript:alert(1)')).toBe('')
    expect(safeHttpUrl('/relative')).toBe('')
    expect(safeHttpUrl('hhttps://fine.house.gov/contact')).toBe('')
  })
})

describe('safePhoneUrl', () => {
  it('normalizes ordinary US phone formatting', () => {
    expect(safePhoneUrl('(202) 225-3121')).toBe('tel:2022253121')
    expect(safePhoneUrl('+1 202-225-3121')).toBe('tel:+12022253121')
  })

  it('rejects values that could break out of an href', () => {
    expect(safePhoneUrl('202-555-0100" onclick="alert(1)')).toBe('')
  })
})
