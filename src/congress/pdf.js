// Client-side PDF letter generation via pdf-lib. Letter-size, 1-inch margins,
// standard embedded fonts. Same quality bar as the BMW notice tool: wraps
// long free-text across pages correctly.
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { downloadBlob } from '../shared/ui.js'

const PAGE_WIDTH = 612 // 8.5in * 72
const PAGE_HEIGHT = 792 // 11in * 72
const MARGIN = 72 // 1in
const FONT_SIZE = 11
const LINE_HEIGHT = 15

// Breaks text into wrapped lines that fit maxWidth, hard-breaking any single
// "word" (e.g. a long URL) that alone exceeds it. Ported from the equivalent
// wrapLine() in src/bmw/pdf.js to keep the same PDF quality bar.
function wrapText(text, font, size, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean)
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
    const test = current ? `${current} ${word}` : word
    if (current && font.widthOfTextAtSize(test, size) > maxWidth) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

// blocks: see content.js letterBlocks(). Returns the filename it downloaded.
export async function downloadLetterPdf(blocks, filenameBase) {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.TimesRoman)
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold)
  const maxWidth = PAGE_WIDTH - MARGIN * 2

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let y = PAGE_HEIGHT - MARGIN

  function newPage() {
    page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    y = PAGE_HEIGHT - MARGIN
  }
  function ensureSpace(height = LINE_HEIGHT) {
    if (y - height < MARGIN) newPage()
  }
  function drawLine(text, useFont) {
    ensureSpace()
    page.drawText(text, { x: MARGIN, y, size: FONT_SIZE, font: useFont || font })
    y -= LINE_HEIGHT
  }

  // The closing block ('Sincerely,' through the sender's contact line) has
  // no page-break reservation of its own: each line only ensures room for
  // itself, so with a long ownWords paragraph pushing close to the bottom of
  // the page, the contact line can orphan onto a fresh page by itself, away
  // from 'Sincerely,' and the name above it. Measure the whole closing
  // block's wrapped height up front and reserve it with one ensureSpace
  // call, mirroring sigBlockHeight in src/bmw/pdf.js.
  const closingStart = blocks.findIndex((b) => b.type === 'line' && b.text === 'Sincerely,')
  let closingHeight = 0
  if (closingStart !== -1) {
    for (const block of blocks.slice(closingStart)) {
      closingHeight +=
        block.type === 'space'
          ? LINE_HEIGHT * 0.5
          : wrapText(block.text, font, FONT_SIZE, maxWidth).length * LINE_HEIGHT
    }
  }

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    if (i === closingStart) ensureSpace(closingHeight)
    if (block.type === 'space') {
      y -= LINE_HEIGHT * 0.5
      continue
    }
    if (block.type === 'label') {
      drawLine(block.text, bold)
      continue
    }
    if (block.type === 'line') {
      // Lines can still be long (addresses, URLs); wrap defensively.
      for (const line of wrapText(block.text, font, FONT_SIZE, maxWidth)) drawLine(line)
      continue
    }
    // 'para'
    for (const line of wrapText(block.text, font, FONT_SIZE, maxWidth)) drawLine(line)
  }

  const bytes = await doc.save()
  const filename = `${filenameBase}.pdf`
  downloadBlob(bytes, filename)
  return filename
}
