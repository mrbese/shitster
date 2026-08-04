// Client-side PDF generation for the Section 30.A notice of dispute.
// Everything happens in the browser. Nothing here makes a network call.
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { formatLongDate, formatUsd, parseDateInput } from './validate.js'

const PAGE_WIDTH = 612 // 8.5in
const PAGE_HEIGHT = 792 // 11in
const MARGIN = 72 // 1in
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const INK = rgb(0.086, 0.086, 0.102)

const BODY_SIZE = 11
const HEAD_SIZE = 11
const LINE_GAP = 14
const PARA_GAP = 10

// Breaks a single line of text into wrapped lines that fit maxWidth,
// hard-breaking any single "word" (e.g. a long URL) that alone exceeds it.
function wrapLine(text, font, size, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean)
  if (!words.length) return ['']
  const lines = []
  let current = ''
  for (const word of words) {
    if (font.widthOfTextAtSize(word, size) > maxWidth) {
      if (current) {
        lines.push(current)
        current = ''
      }
      let chunk = ''
      for (const ch of word) {
        const candidate = chunk + ch
        if (font.widthOfTextAtSize(candidate, size) > maxWidth && chunk) {
          lines.push(chunk)
          chunk = ch
        } else {
          chunk = candidate
        }
      }
      current = chunk
      continue
    }
    const candidate = current ? current + ' ' + word : word
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines
}

class LetterWriter {
  constructor(pdfDoc, font, boldFont) {
    this.pdfDoc = pdfDoc
    this.font = font
    this.boldFont = boldFont
    this.page = null
    this.y = 0
    this.addPage()
  }

  addPage() {
    this.page = this.pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    this.y = PAGE_HEIGHT - MARGIN
  }

  ensureSpace(height) {
    if (this.y - height < MARGIN) this.addPage()
  }

  gap(amount = LINE_GAP) {
    this.y -= amount
  }

  // One line of plain text, wrapping if needed. Returns after drawing.
  text(str, { bold = false, size = BODY_SIZE, indent = 0 } = {}) {
    const font = bold ? this.boldFont : this.font
    const lines = wrapLine(str, font, size, CONTENT_WIDTH - indent)
    for (const line of lines) {
      this.ensureSpace(size)
      this.page.drawText(line, { x: MARGIN + indent, y: this.y, size, font, color: INK })
      this.y -= LINE_GAP
    }
  }

  // A block of text that may itself contain the user's own line breaks
  // (paragraphs in the free-text personal statement). Blank lines become
  // extra vertical space rather than being dropped.
  paragraphBlock(str, opts = {}) {
    const rawLines = String(str || '').split(/\r?\n/)
    for (const rawLine of rawLines) {
      if (!rawLine.trim()) {
        this.gap(PARA_GAP)
        continue
      }
      this.text(rawLine, opts)
    }
  }

  heading(str) {
    this.gap(PARA_GAP)
    this.text(str, { bold: true })
    this.gap(4)
  }

  blank(amount = PARA_GAP) {
    this.gap(amount)
  }
}

function buildLetterText(data) {
  const todayLong = formatLongDate(new Date())
  const adDateLong = formatLongDate(parseDateInput(data.adDateValue))
  const relationshipNoun = data.ownership === 'lease' ? 'Lessee' : 'Owner'
  const relationshipVerb = data.ownership === 'lease' ? 'lease' : 'own'
  const amountUsd = formatUsd(data.amount)

  return {
    todayLong,
    adDateLong,
    relationshipNoun,
    relationshipVerb,
    amountUsd
  }
}

export async function generateNoticePdf(data) {
  const derived = buildLetterText(data)
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic)

  const w = new LetterWriter(pdfDoc, font, boldFont)

  w.text(derived.todayLong)
  w.blank()
  w.text('VIA USPS CERTIFIED MAIL, RETURN RECEIPT REQUESTED', { bold: true })
  w.blank()
  w.text('BMW of North America, LLC')
  w.text('Attn: Customer Relations')
  w.text('200 BMW Drive')
  w.text('Woodcliff Lake, NJ 07677')
  w.blank()
  w.text('RE: NOTICE OF DISPUTE UNDER SECTION 30.A OF THE BMW CONNECTEDDRIVE TERMS (REV. 2026-01-01)', { bold: true })
  w.blank()
  w.text('To BMW of North America, LLC:')
  w.blank()
  w.paragraphBlock(
    'I am a BMW owner and ConnectedDrive user. I submit this Notice of Dispute pursuant ' +
    'to Section 30.A of the BMW ConnectedDrive Terms (Rev. 2026-01-01) (the "Terms"). ' +
    'I am represented by no counsel and proceed individually.'
  )

  w.heading('CLAIMANT IDENTITY')
  w.text(`Name: ${data.fullName}`)
  w.text(`Address: ${data.street}, ${data.city}, ${data.addressState} ${data.zip}`)
  w.text(`Email: ${data.email}  Phone: ${data.phone}`)
  w.text(`Vehicle Identification Number: ${data.vin}`)
  w.text(`Vehicle relationship: ${derived.relationshipNoun}`)

  w.heading('DESCRIPTION OF THE DISPUTE AND LEGAL CLAIMS')
  w.paragraphBlock(
    `On or about ${derived.adDateLong}, BMW NA delivered third-party promotional content (an ` +
    'advertisement for the Sony Pictures film "Spider-Man: Brand New Day") to the ' +
    'Control Display of my vehicle. Section 33 of the Terms governs dashboard ' +
    'communications and authorizes messages concerning "Services, trials, expirations, ' +
    'renewals, or other messages, as applicable," that is, matters related to the ' +
    'Services. A third-party motion picture promotion is not such a matter. I am aware ' +
    'that Section 31.c permits BMW NA to use collected information to "provide relevant ' +
    'in-car or in-app information, businesses, locations, advertising, and other ' +
    'purposes." That provision governs how BMW NA may use information it collects ' +
    "about me; it does not enlarge Section 33's grant of authority over what may be " +
    "displayed on the Control Display, and no provision of the Terms authorizes the " +
    "use of my vehicle's primary control interface as a promotional surface for third " +
    'parties. BMW NA has also publicly described the Control Display as a private ' +
    'space that would not become an advertising surface. Delivering third-party ' +
    `promotional content to the primary control interface of a vehicle I ${derived.relationshipVerb} ` +
    'therefore gives rise to the following ' +
    'individual claims: (1) breach of contract, including breach of the implied covenant ' +
    'of good faith and fair dealing, under the Terms; and (2) unlawful and deceptive ' +
    'commercial practices under the New Jersey Consumer Fraud Act, N.J.S.A. 56:8-1 ' +
    `et seq., and/or the consumer protection statute of my state of residence, ${data.residenceStateName}.`
  )

  w.heading('STATEMENT IN MY OWN WORDS')
  w.paragraphBlock(data.personalStatement)

  w.heading('GOOD-FAITH CALCULATION OF THE AMOUNT IN DISPUTE')
  w.paragraphBlock(`${derived.amountUsd} USD, together with an end to the conduct described above.`)

  w.heading('REQUEST FOR PRE-ARBITRATION INFORMAL DISPUTE RESOLUTION')
  w.paragraphBlock(
    'Pursuant to Section 30.A, I request the individual Pre-Arbitration Informal Dispute ' +
    'Resolution conference, by telephone or videoconference, within 30 days after your ' +
    'receipt of this notice. I note that under Section 30.A this conference is individual ' +
    'to me. Please contact me at the email or phone number above to schedule it. If the ' +
    'claims described here are not resolved within 60 days after this notice is sent, ' +
    'I reserve all rights under Section 30.A, including arbitration before the American ' +
    'Arbitration Association and any right to proceed in small claims court.'
  )

  w.blank(2 * PARA_GAP)
  w.text('Signed,')
  w.blank(2 * PARA_GAP)

  // Script-style typed name standing in for a signature, sitting just above
  // its own signature line, with the printed name and a handwriting note below.
  const sigSize = 22
  const sigLineGap = sigSize + 4
  // Wrap both the 22pt script name and the 11pt printed name the same way
  // every other line in this letter wraps (via wrapLine), so a long name
  // cannot run past the right margin instead of overflowing unbroken.
  const sigNameLines = wrapLine(data.fullName, italicFont, sigSize, CONTENT_WIDTH)
  const printedNameLines = wrapLine(data.fullName, font, BODY_SIZE, CONTENT_WIDTH)
  // True height consumed by the block below, computed from the actual
  // wrapped line counts (the way src/optout/main.js's paragraphHeight-based
  // reserve works) rather than a fixed constant: the script-style name
  // (one line per sigLineGap, plus its gap to the rule of sigSize + 6), the
  // gap from the rule down to the printed name, the printed name line(s),
  // the sign-by-hand note line, a small blank, and the date line. A fixed
  // constant undercounts whenever either name wraps, which could split the
  // sign-by-hand note and date onto a fresh page away from the signature
  // line they belong to.
  const sigBlockHeight =
    (sigNameLines.length - 1) * sigLineGap + (sigSize + 6) +
    LINE_GAP +
    printedNameLines.length * LINE_GAP +
    LINE_GAP +
    4 +
    LINE_GAP
  w.ensureSpace(sigBlockHeight)
  sigNameLines.forEach((line, i) => {
    w.page.drawText(line, { x: MARGIN, y: w.y, size: sigSize, font: italicFont, color: INK })
    w.y -= i === sigNameLines.length - 1 ? sigSize + 6 : sigLineGap
  })
  w.page.drawLine({
    start: { x: MARGIN, y: w.y },
    end: { x: MARGIN + 260, y: w.y },
    thickness: 1,
    color: INK
  })
  w.y -= 14
  w.text(data.fullName)
  w.text('(sign by hand before mailing)', { size: 9 })
  w.blank(4)
  w.text(`Date: ${derived.todayLong}`)

  const bytes = await pdfDoc.save()
  return bytes
}

export function noticeFilename(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/)
  const last = parts.length ? parts[parts.length - 1] : 'notice'
  const clean = last.toLowerCase().replace(/[^a-z0-9]/g, '') || 'notice'
  return `notice-of-dispute-bmw-${clean}.pdf`
}
