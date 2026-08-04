import { mountChrome, fetchCount, bumpCount, downloadBlob } from '../shared/ui.js'
import { BRAND } from '../shared/brand.js'
import { STATES } from './states.js'
import {
  normalizeVin,
  validateVin,
  validateAdDate,
  validateAmount,
  requireField,
  findUnsupportedPdfChars,
  AD_WINDOW_MIN,
  AD_WINDOW_MAX
} from './validate.js'
import { generateNoticePdf, noticeFilename } from './pdf.js'

mountChrome()

const app = document.getElementById('app')

const addressStateOptions = STATES.map(
  (s) => `<option value="${s.code}">${s.name} (${s.code})</option>`
).join('')

const residenceStateOptions = STATES.map(
  (s) => `<option value="${s.name}">${s.name}</option>`
).join('')

app.innerHTML = `
  <h1>Send BMW a notice of dispute</h1>
  <p>
    ${BRAND.tagline} BMW put a movie ad on the dashboard of cars people own.
    Section 30.A of the BMW ConnectedDrive Terms requires a written notice of
    dispute before either side can start arbitration. This tool fills one out
    for you, as a PDF, in your browser.
  </p>

  <div class="disclaimer">
    This is a self-help template, not legal advice, and no attorney-client
    relationship exists. You are acting individually, in your own name. Read
    what you sign. If your situation is unusual, talk to a lawyer.
  </div>

  <section id="step-explain">
    <h2>What a notice of dispute does</h2>
    <p>
      A Section 30.A notice is the required first step before arbitration.
      You send it by certified mail. Once BMW receives it, BMW must hold an
      individual phone or video conference with you, the Pre-Arbitration
      Informal Dispute Resolution conference, within 30 days of receipt.
      That conference is yours alone. Section 30.A is explicit that multiple
      people cannot share one conference.
    </p>
    <p>
      If the dispute is not resolved within 60 days after you send the
      notice, you may then file for AAA consumer arbitration or take the
      matter to small claims court, whichever fits your amount in dispute.
      Filing deadlines and the statute of limitations pause while this
      process runs. Separately, under Section 29.f of the Terms, any claim
      must be brought within one year after it arose, so do not sit on this.
    </p>
    <p class="counter">
      <span id="counter-text">Loading count...</span>
    </p>
    <button id="start-btn" class="primary" type="button">Start my notice</button>
  </section>

  <section id="step-form" hidden>
    <h2>Your information</h2>
    <p>
      Nothing you type here leaves this page. The PDF is built in your
      browser and nothing is saved once you close the tab.
    </p>
    <form id="notice-form" novalidate>
      <div id="form-errors" role="alert"></div>

      <label for="fullName">Full name</label>
      <input id="fullName" name="fullName" type="text" autocomplete="name" required>

      <label for="street">Street address</label>
      <input id="street" name="street" type="text" autocomplete="street-address" required>

      <label for="city">City</label>
      <input id="city" name="city" type="text" autocomplete="address-level2" required>

      <label for="addressState">State</label>
      <select id="addressState" name="addressState" required>
        <option value="" disabled selected>Select a state</option>
        ${addressStateOptions}
      </select>

      <label for="zip">ZIP code</label>
      <input id="zip" name="zip" type="text" autocomplete="postal-code" required>

      <label for="email">Email</label>
      <input id="email" name="email" type="email" autocomplete="email" required>

      <label for="phone">Phone</label>
      <input id="phone" name="phone" type="tel" autocomplete="tel" required>

      <label for="vin">Vehicle Identification Number (VIN)</label>
      <input id="vin" name="vin" type="text" maxlength="17" required
        placeholder="17 characters, no I, O, or Q">

      <label for="adDate">Date the ad first appeared on your dashboard</label>
      <input id="adDate" name="adDate" type="date"
        min="${AD_WINDOW_MIN}" max="${AD_WINDOW_MAX}" value="${AD_WINDOW_MIN}" required>

      <label for="ownership">Ownership type</label>
      <select id="ownership" name="ownership" required>
        <option value="own">I own the vehicle</option>
        <option value="lease">I lease the vehicle</option>
      </select>

      <label for="residenceState">State of residence</label>
      <select id="residenceState" name="residenceState" required>
        <option value="" disabled selected>Select a state</option>
        ${residenceStateOptions}
      </select>

      <label for="amount">Amount in dispute (USD)</label>
      <input id="amount" name="amount" type="number" min="0.01" step="0.01" value="100" required>
      <p class="field-help">
        A good-faith estimate; Section 30.A requires a specific number.
        Section 29.d caps BMW's liability at the greater of 12 months of
        Service fees or $100. Many owners who pay less than that annually
        for Services use $100 here.
      </p>

      <label for="personalStatement">
        In your own words: what happened and why you object. Your words, not
        ours. This is the part BMW's lawyers cannot call a form letter.
      </label>
      <textarea id="personalStatement" name="personalStatement" rows="6" required></textarea>

      <p style="margin-top: 1.5rem;">
        <button id="generate-btn" class="primary" type="submit">Generate notice PDF</button>
      </p>
    </form>
  </section>

  <section id="step-generate" hidden>
    <h2>Mail it</h2>
    <p>Your PDF downloaded. Now make it count.</p>
    <ol>
      <li>Print it and sign the signature line by hand.</li>
      <li>
        Send it by USPS Certified Mail, Return Receipt Requested, to:
        BMW of North America, LLC, Attn: Customer Relations,
        200 BMW Drive, Woodcliff Lake, NJ 07677.
      </li>
      <li>Keep the certified mail receipt and the green return receipt card.</li>
      <li>
        Expect contact from BMW to schedule your individual conference within
        30 days of delivery. Note the delivery date, it starts both clocks
        that matter here.
      </li>
    </ol>
    <p>
      Do not have a printer or a trip to the post office in you today? These
      are independent, USPS-integrated mailing services. You pay them
      directly and mail under your own account, this site has no relationship
      with any of them and never sees your letter:
    </p>
    <ul>
      <li><a href="https://mailform.io" target="_blank" rel="noopener">mailform.io</a></li>
      <li><a href="https://www.sendcertifiedmail.com" target="_blank" rel="noopener">sendcertifiedmail.com</a></li>
      <li><a href="https://www.letterstream.com" target="_blank" rel="noopener">letterstream.com</a></li>
    </ul>
    <p>
      Decide for yourself which fits your situation. After AAA arbitration or
      small claims is an option 60 days from now, that is also your call to
      make and to file, not something this site does for you. Neither link
      below is something this site fills out or submits, they are just
      where each process actually happens:
    </p>
    <ul>
      <li>
        <a href="https://www.adr.org/Support" target="_blank" rel="noopener">
          AAA consumer arbitration filing (adr.org)
        </a>
      </li>
      <li>
        <a href="https://www.usa.gov/small-claims-court" target="_blank" rel="noopener">
          Find your state's small claims court (usa.gov)
        </a>
      </li>
    </ul>
  </section>
`

const counterText = document.getElementById('counter-text')
fetchCount().then((count) => {
  if (count === null) {
    counterText.textContent = 'Notices generated: unavailable right now. Goal 5,000.'
    return
  }
  const verb = count === 1 ? 'has' : 'have'
  const noun = count === 1 ? 'owner' : 'owners'
  counterText.textContent = `${count.toLocaleString('en-US')} ${noun} ${verb} generated a notice. Goal 5,000.`
})

document.getElementById('start-btn').addEventListener('click', (event) => {
  event.currentTarget.blur()
  document.getElementById('step-form').hidden = false
  document.getElementById('step-form').scrollIntoView({ behavior: 'smooth', block: 'start' })
  document.getElementById('fullName').focus()
})

const vinInput = document.getElementById('vin')
vinInput.addEventListener('input', () => {
  const cursor = vinInput.selectionStart
  vinInput.value = normalizeVin(vinInput.value)
  if (cursor !== null) vinInput.setSelectionRange(cursor, cursor)
})

const form = document.getElementById('notice-form')
const errorsBox = document.getElementById('form-errors')

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  errorsBox.innerHTML = ''

  const data = Object.fromEntries(new FormData(form).entries())
  data.vin = normalizeVin(data.vin)

  const checks = [
    requireField(data.fullName, 'Full name'),
    requireField(data.street, 'Street address'),
    requireField(data.city, 'City'),
    requireField(data.addressState, 'State'),
    requireField(data.zip, 'ZIP code'),
    requireField(data.email, 'Email'),
    requireField(data.phone, 'Phone'),
    validateVin(data.vin),
    validateAdDate(data.adDate),
    requireField(data.residenceState, 'State of residence'),
    validateAmount(data.amount),
    requireField(data.personalStatement, 'Your personal statement')
  ].filter(Boolean)

  // The PDF is built with pdf-lib's standard fonts, which only support the
  // WinAnsi character set. Anything outside it (CJK, emoji, many non-Latin
  // diacritics) throws deep inside pdf-lib with no useful message, so catch
  // it here and tell the user which characters need to go before we try.
  const textFields = [
    ['Full name', data.fullName],
    ['Street address', data.street],
    ['City', data.city],
    ['ZIP code', data.zip],
    ['Email', data.email],
    ['Phone', data.phone],
    ['Your personal statement', data.personalStatement]
  ]
  for (const [label, value] of textFields) {
    const bad = findUnsupportedPdfChars(value)
    if (bad.length) {
      checks.push(
        `${label} has a character the PDF can't render: ${bad.join(' ')}. ` +
        'Remove or replace it and try again.'
      )
    }
  }

  if (checks.length) {
    const list = document.createElement('ul')
    list.className = 'field-error'
    for (const message of checks) {
      const li = document.createElement('li')
      li.textContent = message
      list.appendChild(li)
    }
    errorsBox.appendChild(list)
    errorsBox.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }

  const generateBtn = document.getElementById('generate-btn')
  generateBtn.disabled = true
  generateBtn.textContent = 'Building PDF...'

  try {
    const bytes = await generateNoticePdf({
      fullName: data.fullName.trim(),
      street: data.street.trim(),
      city: data.city.trim(),
      addressState: data.addressState,
      zip: data.zip.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      vin: data.vin,
      adDateValue: data.adDate,
      ownership: data.ownership,
      residenceStateName: data.residenceState,
      amount: data.amount,
      personalStatement: data.personalStatement.trim()
    })

    downloadBlob(bytes, noticeFilename(data.fullName))

    const generateSection = document.getElementById('step-generate')
    generateSection.hidden = false
    generateSection.scrollIntoView({ behavior: 'smooth', block: 'start' })

    bumpCount()
  } catch (err) {
    const list = document.createElement('ul')
    list.className = 'field-error'
    const li = document.createElement('li')
    li.textContent =
      'Could not build the PDF. This is usually caused by a character the ' +
      'PDF format can\'t render. Check your name, address, and personal ' +
      'statement for unusual symbols or characters, then try again.'
    list.appendChild(li)
    errorsBox.innerHTML = ''
    errorsBox.appendChild(list)
    errorsBox.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } finally {
    generateBtn.disabled = false
    generateBtn.textContent = 'Generate notice PDF'
  }
})
