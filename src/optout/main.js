import { mountChrome, downloadBlob } from '../shared/ui.js'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { findUnsupportedPdfChars } from '../bmw/validate.js'

mountChrome()

const app = document.getElementById('app')

const BMW_ADDRESS_LINES = [
  'BMW of North America, LLC',
  'Attn: Customer Relations',
  'PO Box 1227',
  'Westwood, NJ 07675-1227'
]

const DISCLAIMER = `This is a self-help template, not legal advice, and no attorney-client
relationship exists. You are acting individually, in your own name. Read what you sign.
If your situation is unusual, talk to a lawyer.`

// Local-date "YYYY-MM-DD" for today, used to cap the date-of-first-acceptance
// input: that date is when you accepted a BMW agreement, which cannot be in
// the future. Built from local calendar components (not toISOString(), which
// is UTC and can print the wrong day depending on the browser's time zone)
// to match parseDateInput()'s local-date handling below.
function todayIsoLocal() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

const TODAY_ISO = todayIsoLocal()

app.innerHTML = `
  <style>
    .lede { color: var(--muted); max-width: 40rem; }
    .facts {
      border-left: 3px solid var(--accent); padding: 0.25rem 1rem; margin: 1.75rem 0;
    }
    .facts p { margin: 0.6rem 0; }
    .deadline-box {
      border: 1.5px solid var(--line); padding: 1rem 1.25rem; margin: 1.5rem 0;
      display: none;
    }
    .deadline-box.ok { border-color: var(--accent); }
    .deadline-box.late { border-color: var(--ink); }
    .deadline-box .label {
      font-family: var(--mono); font-size: 0.8rem; color: var(--muted);
      text-transform: uppercase; letter-spacing: 0.06em; display: block; margin-bottom: 0.35rem;
    }
    .deadline-box .date { font-size: 1.5rem; font-weight: 700; }
    .deadline-box.ok .date { color: var(--accent); }
    .deadline-box p.note { color: var(--muted); margin: 0.75rem 0 0; font-size: 0.92rem; }
    fieldset { border: none; padding: 0; margin: 0; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 0 1rem; }
    .actions { margin-top: 1.75rem; display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
    #status { font-size: 0.9rem; color: var(--muted); }
    .disclaimer { white-space: pre-line; }
    .mail-steps { margin-top: 2.5rem; }
    .mail-steps ol { padding-left: 1.25rem; }
    .mail-steps li { margin: 0.4rem 0; }
  </style>

  <h1>Opt out of arbitration</h1>
  <p class="lede">
    Section 30.B of the BMW ConnectedDrive Terms lets you opt out of the
    Agreement to Arbitrate entirely, in writing, if you act in time. Read the
    fine print below before you fill anything in.
  </p>

  <div class="facts">
    <p>
      The deadline is 30 days from the EARLIER of (1) the date you accepted the
      Terms, or (2) the date you FIRST agreed to any BMW North America agreement
      containing an arbitration provision.
    </p>
    <p>
      <strong>The hard truth:</strong> for most existing owners, that earlier date
      was years ago. This opt-out is realistically only open to new owners and
      people activating ConnectedDrive for the first time. Section 30.B requires
      strict compliance. There is no exception for missing the deadline by a day.
    </p>
  </div>

  <form id="optout-form" novalidate>
    <label for="first-accept">Date of first acceptance</label>
    <p style="color: var(--muted); font-size: 0.88rem; margin: -0.2rem 0 0;">
      The earlier of when you accepted the Terms or first agreed to any BMW NA
      agreement with an arbitration clause. If unsure, use your purchase or
      activation date.
    </p>
    <input type="date" id="first-accept" max="${TODAY_ISO}" required>

    <div id="deadline-box" class="deadline-box">
      <span class="label">Postmark deadline</span>
      <span class="date" id="deadline-date"></span>
      <p class="note" id="deadline-note"></p>
    </div>

    <label for="name">Full name</label>
    <input type="text" id="name" autocomplete="name" required>

    <label for="address">Mailing address</label>
    <input type="text" id="address" autocomplete="street-address" placeholder="Street, city, state, ZIP" required>

    <div class="row">
      <div>
        <label for="phone">Phone</label>
        <input type="tel" id="phone" autocomplete="tel" required>
      </div>
      <div>
        <label for="email">Email</label>
        <input type="email" id="email" autocomplete="email" required>
      </div>
    </div>

    <div class="actions">
      <button type="submit" id="generate-btn" class="btn primary">Generate opt-out letter (PDF)</button>
      <a href="bmw.html" id="bmw-link" class="btn ghost" style="display:none;">Use the BMW notice tool instead</a>
      <span id="status"></span>
    </div>
  </form>

  <div class="mail-steps">
    <h3>After you download it</h3>
    <ol>
      <li>
        Print it and sign the signature line by hand. Section 30.B itself
        does not list a signature among its required contents, but a
        handwritten signature is a prudent, low-cost way to show the letter
        is really from you.
      </li>
      <li>Mail it so it is postmarked on or before your deadline above.</li>
      <li>Keep proof of mailing. A certificate of mailing or tracking receipt from
        the post office is enough; strict compliance means you may need to show
        it was timely.</li>
      <li>Keep a copy of the signed letter for your own records.</li>
    </ol>
  </div>

  <div class="disclaimer">${DISCLAIMER}</div>
`

const firstAcceptInput = document.getElementById('first-accept')
const deadlineBox = document.getElementById('deadline-box')
const deadlineDate = document.getElementById('deadline-date')
const deadlineNote = document.getElementById('deadline-note')
const bmwLink = document.getElementById('bmw-link')
const generateBtn = document.getElementById('generate-btn')
const statusEl = document.getElementById('status')

function formatDate(d) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function parseDateInput(value) {
  // value is YYYY-MM-DD. Construct as a LOCAL calendar date (not UTC): the
  // rest of this module (deadline math, "today", formatDate) all works in
  // local time, and mixing in a UTC-constructed date shifts the rendered
  // day by one for any negative UTC offset (i.e. all of the US). See
  // src/bmw/validate.js:parseDateInput for the same pattern.
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Pure: derives the deadline and its past/future status from the raw input
// value, with no dependency on module-level state. Called both by the
// change/input listeners (to update the on-screen deadline box) and by the
// submit handler (to decide which letter language to print), so the two can
// never drift out of sync, including when a value is restored into the
// input without a `change` event firing (bfcache back-navigation, form
// autofill, soft reload with form-value restoration).
function computeDeadline(value) {
  if (!value) return null
  const accepted = parseDateInput(value)
  const deadline = new Date(accepted)
  deadline.setDate(deadline.getDate() + 30)

  const today = new Date()
  const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const isPast = todayLocal.getTime() > deadline.getTime()

  return { deadline, isPast }
}

function refreshDeadlineBox() {
  const result = computeDeadline(firstAcceptInput.value)
  if (!result) {
    deadlineBox.style.display = 'none'
    return
  }
  const { deadline, isPast } = result

  deadlineBox.style.display = 'block'
  deadlineDate.textContent = formatDate(deadline)

  if (isPast) {
    deadlineBox.className = 'deadline-box late'
    deadlineNote.textContent =
      'This deadline has already passed. Section 30.B requires strict compliance, ' +
      'so a letter postmarked now is unlikely to count as a timely opt-out. The BMW ' +
      'notice of dispute tool is the realistic next step.'
    generateBtn.textContent = 'Generate anyway (not recommended)'
    generateBtn.classList.remove('primary')
    generateBtn.classList.add('ghost')
    bmwLink.style.display = 'inline-block'
  } else {
    deadlineBox.className = 'deadline-box ok'
    deadlineNote.textContent =
      'Mail your letter so it is postmarked on or before this date.'
    generateBtn.textContent = 'Generate opt-out letter (PDF)'
    generateBtn.classList.add('primary')
    generateBtn.classList.remove('ghost')
    bmwLink.style.display = 'none'
  }
}

firstAcceptInput.addEventListener('change', refreshDeadlineBox)
firstAcceptInput.addEventListener('input', refreshDeadlineBox)
window.addEventListener('pageshow', refreshDeadlineBox)
refreshDeadlineBox()

// Ported from the equivalent wrapLine() in src/bmw/pdf.js to keep the same
// PDF quality bar: hard-breaks any single "word" (e.g. a long email address
// or a pasted address string with no spaces) that alone exceeds maxWidth,
// instead of drawing it as one line running past the page margin. Splits on
// /\s+/ with .filter(Boolean) rather than a plain ' ' split so runs of
// consecutive spaces or a tab do not produce empty "words" that inflate the
// measured line width.
function wrapText(text, font, size, maxWidth) {
  const paragraphs = String(text).split('\n')
  const lines = []
  for (const para of paragraphs) {
    if (para.trim() === '') { lines.push(''); continue }
    const words = para.split(/\s+/).filter(Boolean)
    let line = ''
    for (const word of words) {
      if (font.widthOfTextAtSize(word, size) > maxWidth) {
        if (line) {
          lines.push(line)
          line = ''
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
        line = chunk
        continue
      }
      const trial = line ? `${line} ${word}` : word
      if (font.widthOfTextAtSize(trial, size) > maxWidth && line) {
        lines.push(line)
        line = word
      } else {
        line = trial
      }
    }
    if (line) lines.push(line)
  }
  return lines
}

async function buildLetter(data) {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  const pageWidth = 612
  const pageHeight = 792
  const margin = 72
  const maxWidth = pageWidth - margin * 2
  const bodySize = 11
  const lineHeight = 15

  let page = doc.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

  function newPageIfNeeded(needed) {
    if (y - needed < margin) {
      page = doc.addPage([pageWidth, pageHeight])
      y = pageHeight - margin
    }
  }

  function drawParagraph(text, { size = bodySize, useFont = font, gapAfter = lineHeight } = {}) {
    const lines = wrapText(text, useFont, size, maxWidth)
    for (const line of lines) {
      newPageIfNeeded(lineHeight)
      page.drawText(line, { x: margin, y, size, font: useFont, color: rgb(0, 0, 0) })
      y -= lineHeight
    }
    // Only pull the cursor down further when gapAfter calls for more space
    // than the line advance already gave it. When gapAfter is 0 (or less
    // than lineHeight), `gapAfter - lineHeight` is negative, which would
    // move the cursor back UP and let later content overlap what was just
    // drawn.
    if (gapAfter > lineHeight) y -= gapAfter - lineHeight
  }

  // Mirrors the height drawParagraph will actually consume for the given
  // text/options, without drawing anything, so the closing signature block
  // can reserve exactly the room it needs before any of it is drawn.
  function paragraphHeight(text, { size = bodySize, useFont = font, gapAfter = lineHeight } = {}) {
    const lines = wrapText(text, useFont, size, maxWidth)
    let h = lines.length * lineHeight
    if (gapAfter > lineHeight) h += gapAfter - lineHeight
    return h
  }

  drawParagraph(data.today, { gapAfter: lineHeight * 2 })
  drawParagraph('VIA USPS MAIL, POSTMARKED BY THE DEADLINE STATED BELOW', { useFont: bold, gapAfter: lineHeight * 2 })

  for (const line of BMW_ADDRESS_LINES) {
    drawParagraph(line, { gapAfter: lineHeight })
  }
  y -= lineHeight

  drawParagraph(
    'RE: OPT-OUT OF ARBITRATION AGREEMENT UNDER SECTION 30.B OF THE BMW ' +
    'CONNECTEDDRIVE TERMS (REV. 2026-01-01)',
    { useFont: bold, gapAfter: lineHeight * 2 }
  )

  drawParagraph('To BMW of North America, LLC:', { gapAfter: lineHeight * 1.5 })

  drawParagraph(
    'I do not agree to the Agreement to Arbitrate contained in Section 30 of the ' +
    'BMW ConnectedDrive Terms (Rev. 2026-01-01) (the "Terms"). I am exercising my ' +
    'right to opt out of that arbitration provision under Section 30.B.',
    { gapAfter: lineHeight * 1.5 }
  )

  drawParagraph('MY INFORMATION', { useFont: bold, gapAfter: lineHeight * 1.25 })
  drawParagraph(`Name: ${data.name}`)
  drawParagraph(`Address: ${data.address}`)
  drawParagraph(`Phone: ${data.phone}`)
  drawParagraph(`Email: ${data.email}`, { gapAfter: lineHeight * 1.5 })

  if (data.deadlineIsPast) {
    drawParagraph(
      `I first agreed to a BMW North America agreement containing an arbitration ` +
      `provision on ${data.firstAcceptFormatted}. I am submitting this opt-out under ` +
      'Section 30.B and ask that it be recorded, whether or not it is treated as timely.',
      { gapAfter: lineHeight * 1.5 }
    )
  } else {
    drawParagraph(
      `This notice is being mailed within 30 days of ${data.firstAcceptFormatted}, the ` +
      'date I first agreed to a BMW North America agreement containing an arbitration ' +
      'provision. This opt-out is timely under Section 30.B.',
      { gapAfter: lineHeight * 1.5 }
    )
  }

  drawParagraph(
    'Please record this opt-out against my account and confirm in writing that the ' +
    'Agreement to Arbitrate in Section 30 does not apply to me or to any dispute ' +
    'between me and BMW of North America, LLC.',
    { gapAfter: lineHeight * 2.5 }
  )

  // newPageIfNeeded(lineHeight * 6) undercounted whenever the
  // "[name] (sign by hand before mailing)" line wraps (long names): compute
  // the reserve from the actual wrapped line count of each piece of the
  // closing block, the same way sigBlockHeight in src/bmw/pdf.js now
  // computes its reserve from the wrapped line counts of the script-style
  // and printed name, instead of a fixed constant.
  const closingHeight =
    paragraphHeight('Signed,', { gapAfter: lineHeight * 3 }) +
    paragraphHeight('_______________________________', { gapAfter: lineHeight }) +
    paragraphHeight(`${data.name} (sign by hand before mailing)`, { gapAfter: lineHeight }) +
    paragraphHeight(`Date: ${data.today}`, { gapAfter: 0 })
  newPageIfNeeded(closingHeight)
  drawParagraph('Signed,', { gapAfter: lineHeight * 3 })
  drawParagraph('_______________________________', { gapAfter: lineHeight })
  drawParagraph(`${data.name} (sign by hand before mailing)`, { gapAfter: lineHeight })
  drawParagraph(`Date: ${data.today}`, { gapAfter: 0 })

  return doc.save()
}

document.getElementById('optout-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  statusEl.textContent = ''

  const name = document.getElementById('name').value.trim()
  const address = document.getElementById('address').value.trim()
  const phone = document.getElementById('phone').value.trim()
  const email = document.getElementById('email').value.trim()

  if (!firstAcceptInput.value || !name || !address || !phone || !email) {
    statusEl.textContent = 'Fill in every field first.'
    return
  }

  // The date of first acceptance cannot be in the future: it is when you
  // accepted a BMW agreement, an event that has already happened or is
  // happening today. The input's max="${TODAY_ISO}" attribute stops most
  // pickers from offering a future date, but a typed or pasted value can
  // still get past it, so check again here with a plain error.
  const acceptedDate = parseDateInput(firstAcceptInput.value)
  const todayLocal = new Date()
  const todayMidnight = new Date(todayLocal.getFullYear(), todayLocal.getMonth(), todayLocal.getDate())
  if (!acceptedDate || acceptedDate.getTime() > todayMidnight.getTime()) {
    statusEl.textContent = 'The date of first acceptance cannot be in the future. Enter today\'s date or an earlier one.'
    return
  }

  // pdf-lib's standard fonts only support the WinAnsi character set. Check
  // every field that gets drawn into the PDF before generating it, so we can
  // tell the user exactly which character to remove instead of failing with
  // an unrecoverable "Try again" after a doomed retry loop.
  const textFields = [
    ['Full name', name],
    ['Mailing address', address],
    ['Phone', phone],
    ['Email', email]
  ]
  const badChars = []
  for (const [, value] of textFields) {
    for (const ch of findUnsupportedPdfChars(value)) {
      if (!badChars.includes(ch)) badChars.push(ch)
    }
  }
  if (badChars.length) {
    const fieldNames = textFields
      .filter(([, value]) => findUnsupportedPdfChars(value).length)
      .map(([label]) => label)
      .join(', ')
    statusEl.textContent =
      `${fieldNames} ${fieldNames.includes(',') ? 'have' : 'has'} a character the PDF ` +
      `can't render: ${badChars.join(' ')}. Remove or replace it and try again.`
    return
  }

  const today = new Date()
  const todayFormatted = formatDate(today)
  const firstAcceptFormatted = formatDate(parseDateInput(firstAcceptInput.value))
  const deadlineResult = computeDeadline(firstAcceptInput.value)
  const deadlineIsPast = deadlineResult ? deadlineResult.isPast : true

  statusEl.textContent = 'Building your PDF...'

  try {
    const bytes = await buildLetter({
      name, address, phone, email,
      today: todayFormatted,
      firstAcceptFormatted,
      deadlineIsPast
    })

    const lastName = (name.trim().split(/\s+/).pop() || 'owner').toLowerCase().replace(/[^a-z-]/g, '')
    downloadBlob(bytes, `arbitration-opt-out-bmw-${lastName || 'owner'}.pdf`)

    statusEl.textContent = 'Downloaded. Sign it by hand, then mail it before your deadline.'
  } catch (err) {
    statusEl.textContent = 'Something went wrong generating the PDF. Try again.'
  }
})
