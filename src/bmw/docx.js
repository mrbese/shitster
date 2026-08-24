// Client-side .docx generation, for anyone who would rather fill in the rest
// (VIN, address, whatever they skipped) by hand in Word than type it into a
// browser. Renders the same letter.js model as the PDF, so the operative
// legal text matches exactly; only the file format differs.
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { buildLetterModel, noticeFileStem } from './letter.js'

const BODY_SIZE = 22 // half-points: 11pt
const SPACING_AFTER = 160

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? SPACING_AFTER },
    children: [new TextRun({ text, bold: !!opts.bold, size: BODY_SIZE })]
  })
}

function heading(text) {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, size: BODY_SIZE })]
  })
}

export async function generateNoticeDocx(data) {
  const letter = buildLetterModel(data)

  const children = [
    p(letter.todayLong),
    p(letter.certifiedLine, { bold: true }),
    ...letter.recipientLines.map((line) => p(line, { after: 0 })),
    p(''),
    p(letter.reLine, { bold: true }),
    p(letter.salutation),
    p(letter.intro),

    heading(letter.claimantIdentity.heading),
    ...letter.claimantIdentity.lines.map((line) => p(line, { after: 0 })),

    heading(letter.dispute.heading),
    p(letter.dispute.paragraph),

    heading(letter.statement.heading),
    ...letter.statement.lines.map((line) => p(line, { after: 0 })),

    heading(letter.amount.heading),
    p(letter.amount.paragraph),

    heading(letter.request.heading),
    p(letter.request.paragraph),

    p('', { after: SPACING_AFTER * 2 }),
    p('Signed,'),
    p('', { after: SPACING_AFTER }),
    p('_______________________________'),
    p(letter.signOffName, { after: 0 }),
    new Paragraph({
      spacing: { after: SPACING_AFTER },
      children: [new TextRun({ text: '(sign by hand before mailing)', italics: true, size: 18 })]
    }),
    p(`Date: ${letter.todayLong}`)
  ]

  const doc = new Document({
    sections: [
      {
        properties: {},
        children
      }
    ]
  })

  return Packer.toBlob(doc)
}

export function noticeDocxFilename(fullName) {
  return `notice-of-dispute-bmw-${noticeFileStem(fullName)}.docx`
}
