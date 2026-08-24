// Client-side PDF generation for the Section 30.A notice of dispute.
// Everything happens in the browser. Nothing here makes a network call.
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { buildLetterModel, noticeFileStem } from './letter.js'

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

export async function generateNoticePdf(data) {
  const letter = buildLetterModel(data)
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic)

  const w = new LetterWriter(pdfDoc, font, boldFont)

  w.text(letter.todayLong)
  w.blank()
  w.text(letter.certifiedLine, { bold: true })
  w.blank()
  for (const line of letter.recipientLines) w.text(line)
  w.blank()
  w.text(letter.reLine, { bold: true })
  w.blank()
  w.text(letter.salutation)
  w.blank()
  w.paragraphBlock(letter.intro)

  w.heading(letter.claimantIdentity.heading)
  for (const line of letter.claimantIdentity.lines) w.text(line)

  w.heading(letter.dispute.heading)
  w.paragraphBlock(letter.dispute.paragraph)

  w.heading(letter.statement.heading)
  w.paragraphBlock(letter.statement.lines.join('\n'))

  w.heading(letter.amount.heading)
  w.paragraphBlock(letter.amount.paragraph)

  w.heading(letter.request.heading)
  w.paragraphBlock(letter.request.paragraph)

  w.blank(2 * PARA_GAP)
  w.text('Signed,')
  w.blank(2 * PARA_GAP)

  // Script-style typed name standing in for a signature, sitting just above
  // its own signature line, with the printed name and a handwriting note below.
  // A blank name has nothing to render in script, so it falls through to a
  // plain signature line with a print-your-name note instead.
  const hasName = String(data.fullName || '').trim() !== ''
  const sigSize = 22
  const sigLineGap = sigSize + 4
  // Wrap both the 22pt script name and the 11pt printed name the same way
  // every other line in this letter wraps (via wrapLine), so a long name
  // cannot run past the right margin instead of overflowing unbroken.
  const sigNameLines = hasName ? wrapLine(letter.signOffName, italicFont, sigSize, CONTENT_WIDTH) : []
  const printedNameLines = wrapLine(letter.signOffName, font, BODY_SIZE, CONTENT_WIDTH)
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
    (hasName ? (sigNameLines.length - 1) * sigLineGap + (sigSize + 6) : sigSize + 6) +
    LINE_GAP +
    printedNameLines.length * LINE_GAP +
    LINE_GAP +
    4 +
    LINE_GAP
  w.ensureSpace(sigBlockHeight)
  if (hasName) {
    sigNameLines.forEach((line, i) => {
      w.page.drawText(line, { x: MARGIN, y: w.y, size: sigSize, font: italicFont, color: INK })
      w.y -= i === sigNameLines.length - 1 ? sigSize + 6 : sigLineGap
    })
  } else {
    w.y -= sigSize + 6
  }
  w.page.drawLine({
    start: { x: MARGIN, y: w.y },
    end: { x: MARGIN + 260, y: w.y },
    thickness: 1,
    color: INK
  })
  w.y -= 14
  w.text(letter.signOffName)
  w.text(
    hasName ? '(sign by hand before mailing)' : '(sign and print your name by hand before mailing)',
    { size: 9 }
  )
  w.blank(4)
  w.text(`Date: ${letter.todayLong}`)

  const bytes = await pdfDoc.save()
  return bytes
}

export function noticeFilename(fullName) {
  return `notice-of-dispute-bmw-${noticeFileStem(fullName)}.pdf`
}
