// Shared letter content for the PDF and the editable Word (.docx) output.
// Both formats render this same model so the operative legal text can never
// drift between them. Every field is optional: whatever the user left blank
// becomes a blank line to fill in by hand or in Word, never a guess.
import { formatLongDate, formatUsd, normalizeVin, parseDateInput } from './validate.js'

export const BLANK = '_'.repeat(28)

function fill(value) {
  const v = String(value || '').trim()
  return v || BLANK
}

function hasValue(value) {
  return String(value || '').trim() !== ''
}

// The personal statement is the one place algorithmic text is never
// substituted (SPEC-SHARED.md: variation comes only from the user's own
// words). A blank statement becomes ruled blank lines to write on, not
// placeholder prose.
function statementLines(value) {
  const trimmed = String(value || '').trim()
  if (trimmed) return trimmed.split(/\r?\n/)
  return Array(5).fill(BLANK)
}

// Shared filename stem for both the PDF and the docx download, so the two
// artifacts for the same notice are easy to tell apart only by extension.
export function noticeFileStem(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean)
  const last = parts.length ? parts[parts.length - 1] : 'notice'
  return last.toLowerCase().replace(/[^a-z0-9]/g, '') || 'notice'
}

export function buildLetterModel(data) {
  const vin = normalizeVin(data.vin)
  const adDate = hasValue(data.adDateValue) ? parseDateInput(data.adDateValue) : null
  const adDateLong = adDate ? formatLongDate(adDate) : BLANK
  const relationshipNoun = data.ownership === 'lease' ? 'Lessee' : 'Owner'
  const relationshipVerb = data.ownership === 'lease' ? 'lease' : 'own'
  const amountLine = hasValue(data.amount) && Number.isFinite(Number(data.amount))
    ? `${formatUsd(data.amount)} USD`
    : `${BLANK} USD`
  const residenceStateName = fill(data.residenceStateName)

  return {
    todayLong: formatLongDate(new Date()),
    certifiedLine: 'VIA USPS CERTIFIED MAIL, RETURN RECEIPT REQUESTED',
    recipientLines: [
      'BMW of North America, LLC',
      'Attn: Customer Relations',
      '200 BMW Drive',
      'Woodcliff Lake, NJ 07677'
    ],
    reLine: 'RE: NOTICE OF DISPUTE UNDER SECTION 30.A OF THE BMW CONNECTEDDRIVE TERMS (REV. 2026-01-01)',
    salutation: 'To BMW of North America, LLC:',
    intro:
      'I am a BMW owner and ConnectedDrive user. I submit this Notice of Dispute pursuant ' +
      'to Section 30.A of the BMW ConnectedDrive Terms (Rev. 2026-01-01) (the "Terms"). ' +
      'I am represented by no counsel and proceed individually.',
    claimantIdentity: {
      heading: 'CLAIMANT IDENTITY',
      lines: [
        `Name: ${fill(data.fullName)}`,
        `Address: ${fill(data.street)}, ${fill(data.city)}, ${fill(data.addressState)} ${fill(data.zip)}`,
        `Email: ${fill(data.email)}  Phone: ${fill(data.phone)}`,
        `Vehicle Identification Number: ${fill(vin)}`,
        `Vehicle relationship: ${relationshipNoun}`
      ]
    },
    dispute: {
      heading: 'DESCRIPTION OF THE DISPUTE AND LEGAL CLAIMS',
      paragraph:
        `On or about ${adDateLong}, BMW NA delivered third-party promotional content (an ` +
        'advertisement for the Sony Pictures film "Spider-Man: Brand New Day") to the ' +
        'Control Display of my vehicle. Section 33 of the Terms governs dashboard ' +
        'communications and authorizes messages concerning "Services, trials, expirations, ' +
        'renewals, or other messages, as applicable," that is, matters related to the ' +
        'Services. A third-party motion picture promotion is not such a matter. I am aware ' +
        'that Section 31.c permits BMW NA to use collected information to "provide relevant ' +
        'in-car or in-app information, businesses, locations, advertising, and other ' +
        'purposes." That provision governs how BMW NA may use information it collects ' +
        "about me; it does not enlarge Section 33's grant of authority over what may be " +
        'displayed on the Control Display, and no provision of the Terms authorizes the ' +
        "use of my vehicle's primary control interface as a promotional surface for third " +
        "parties. BMW's senior vice president for connected experience also stated " +
        'publicly in December 2023 that BMW would not sell in-car screen space to play ' +
        'a commercial, describing the car as a private space. Delivering third-party ' +
        `promotional content to the primary control interface of a vehicle I ${relationshipVerb} ` +
        'therefore gives rise to the following ' +
        'individual claims: (1) breach of contract, including breach of the implied covenant ' +
        'of good faith and fair dealing, under the Terms; and (2) unlawful and deceptive ' +
        'commercial practices under the New Jersey Consumer Fraud Act, N.J.S.A. 56:8-1 ' +
        `et seq., and/or the consumer protection statute of my state of residence, ${residenceStateName}.`
    },
    statement: {
      heading: 'STATEMENT IN MY OWN WORDS',
      lines: statementLines(data.personalStatement)
    },
    amount: {
      heading: 'GOOD-FAITH CALCULATION OF THE AMOUNT IN DISPUTE',
      paragraph: `${amountLine}, together with an end to the conduct described above.`
    },
    request: {
      heading: 'REQUEST FOR PRE-ARBITRATION INFORMAL DISPUTE RESOLUTION',
      paragraph:
        'Pursuant to Section 30.A, I request the individual Pre-Arbitration Informal Dispute ' +
        'Resolution conference, by telephone or videoconference, within 30 days after your ' +
        'receipt of this notice. I note that under Section 30.A this conference is individual ' +
        'to me. Please contact me at the email or phone number above to schedule it. If the ' +
        'claims described here are not resolved within 60 days after this notice is sent, ' +
        'I reserve all rights under Section 30.A, including arbitration before the American ' +
        'Arbitration Association and any right to proceed in small claims court.'
    },
    signOffName: fill(data.fullName)
  }
}
