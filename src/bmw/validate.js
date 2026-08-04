// Validation and formatting helpers. No PII is stored; these are pure functions
// that operate on whatever the caller passes in.

// 17 chars, no I, O, or Q (ISO 3779). Case-insensitive input, normalized to upper.
const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/

export function normalizeVin(raw) {
  return String(raw || '').trim().toUpperCase()
}

export function validateVin(raw) {
  const vin = normalizeVin(raw)
  if (vin.length !== 17) {
    return 'VIN must be exactly 17 characters.'
  }
  if (!VIN_RE.test(vin)) {
    return 'VIN can only use letters and numbers, and never the letters I, O, or Q.'
  }
  return null
}

// Parse a YYYY-MM-DD date input value as a local calendar date, not UTC,
// so it does not shift a day depending on the browser's time zone.
export function parseDateInput(value) {
  const [y, m, d] = String(value || '').split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

const LONG_DATE = { year: 'numeric', month: 'long', day: 'numeric' }

export function formatLongDate(date) {
  if (!date || Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', LONG_DATE).format(date)
}

export function formatUsd(amount) {
  const n = Number(amount)
  if (!Number.isFinite(n)) return '0.00'
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function requireField(value, label) {
  if (!String(value || '').trim()) return `${label} is required.`
  return null
}

export const AD_WINDOW_MIN = '2026-07-27'
export const AD_WINDOW_MAX = '2026-08-10'

export function validateAdDate(value) {
  const d = parseDateInput(value)
  const min = parseDateInput(AD_WINDOW_MIN)
  const max = parseDateInput(AD_WINDOW_MAX)
  if (!d) return 'Enter the date the ad first appeared.'
  if (d < min || d > max) {
    return 'The ad ran between July 27 and August 10, 2026. Pick a date in that range.'
  }
  return null
}

export function validateAmount(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) {
    return 'Enter a good-faith amount in dispute greater than zero.'
  }
  return null
}

// Characters pdf-lib's standard fonts (Helvetica/HelveticaBold, WinAnsi
// encoding) can render. Anything outside this set (CJK, emoji, Vietnamese
// or Turkish/Polish diacritics such as "e with circumflex + grave" or a
// cedilla-g, combining marks, etc.) throws deep inside pdf-lib's text-width
// measurement with no useful message, killing PDF generation silently.
// Basic Latin (U+0020-U+007E) plus Latin-1 Supplement (U+00A0-U+00FF) plus
// the small set of extra glyphs Windows-1252 defines above U+2000.
const WINANSI_EXTRA_CODEPOINTS = new Set([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030,
  0x0160, 0x2039, 0x0152, 0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022,
  0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x017e, 0x0178
])

function isWinAnsiChar(ch) {
  const code = ch.codePointAt(0)
  return (
    code === 0x09 ||
    code === 0x0a ||
    code === 0x0d ||
    (code >= 0x20 && code <= 0x7e) ||
    (code >= 0xa0 && code <= 0xff) ||
    WINANSI_EXTRA_CODEPOINTS.has(code)
  )
}

// Returns the distinct characters in `text` that the PDF standard fonts
// cannot render, in first-seen order. Empty array means the text is safe.
export function findUnsupportedPdfChars(text) {
  const seen = []
  for (const ch of String(text || '')) {
    if (!isWinAnsiChar(ch) && !seen.includes(ch)) seen.push(ch)
  }
  return seen
}
