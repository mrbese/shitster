import { mountChrome } from '../shared/ui.js'
import { BRAND } from '../shared/brand.js'
import {
  STATE_NAMES,
  hasSenators,
  memberTitle,
  allStateCodes,
  districtsForState,
  senatorsFor,
  representativeFor,
  displayName
} from './legislators.js'
import { geocodeAddress, GeocodeError } from './geocode.js'
import { callScript, letterBlocks, blocksToPlainText } from './content.js'
import { downloadLetterPdf } from './pdf.js'
import { findUnsupportedPdfChars } from '../bmw/validate.js'

mountChrome()

const app = document.querySelector('#app')

const DISCLAIMER = `
  <div class="disclaimer">
    This is a self-help template, not legal advice, and no attorney-client relationship
    exists. You are acting individually, in your own name. Read what you sign. If your
    situation is unusual, talk to a lawyer.
  </div>
`

app.innerHTML = `
  <h1>Tell Congress to end forced arbitration.</h1>
  <p>
    Address in, your two senators and one representative out. Three ways to reach
    each of them: a 30-second call script, a letter you can paste into a webform,
    and a printable letter addressed for mailing to their district office.
  </p>
  <p>
    The ask is the FAIR Act, the Forced Arbitration Injustice Repeal Act. It would
    make pre-dispute arbitration clauses unenforceable in consumer contracts, the
    kind of clause that sent the BMW dashboard-ad dispute to arbitration instead
    of court in the first place. This tool prepares what you send. You send it.
    ${BRAND.campaign} stores nothing.
  </p>

  <section id="lookup-section">
    <h2>Step 1. Find your senators and representative</h2>
    <p class="disclaimer">
      The only thing this step sends over the network is the address you type
      below, sent to the U.S. Census Bureau's free geocoder to find your
      congressional district. Nothing else on this page leaves your browser.
    </p>
    <label for="addr">Your address</label>
    <input id="addr" type="text" placeholder="123 Main St, Springfield, IL 62704" autocomplete="off">
    <div style="margin-top:0.75rem; display:flex; gap:0.75rem; flex-wrap:wrap;">
      <button id="lookup-btn" class="primary" type="button">Find my representatives</button>
    </div>
    <p id="lookup-status" style="min-height:1.5em;"></p>

    <details id="manual-details">
      <summary>Address lookup not working, or you'd rather pick manually</summary>
      <p>
        Many browsers block this page from calling the Census geocoder directly
        (it does not allow cross-site requests). Pick your state below instead.
        If you do not know your district, use
        <a href="https://www.house.gov/representatives/find-your-representative" target="_blank" rel="noopener">house.gov's representative finder</a>
        and come back with the number.
      </p>
      <label for="manual-state">State or territory</label>
      <select id="manual-state">
        <option value="">Choose one</option>
      </select>
      <div id="manual-district-wrap" hidden>
        <label for="manual-district">Congressional district</label>
        <select id="manual-district"></select>
      </div>
      <div style="margin-top:0.75rem;">
        <button id="manual-btn" type="button">Use this state</button>
      </div>
      <p id="manual-status" style="min-height:1.5em;"></p>
    </details>
  </section>

  <section id="results-section" hidden>
    <h2>Step 2. Your members of Congress</h2>
    <div id="results-note"></div>
    <div id="results-list"></div>
  </section>

  <section id="actions-section" hidden>
    <h2>Step 3. Take action</h2>
    <p>
      Fill this in once. It fills the call script, the webform letter, and the
      printable letter for every member below. None of it leaves your browser
      until you copy or download it yourself.
    </p>
    <label for="f-name">Your full name</label>
    <input id="f-name" type="text" autocomplete="name">
    <label for="f-street">Street address (optional, for the printed letter's return address)</label>
    <input id="f-street" type="text" autocomplete="street-address">
    <label for="f-city">Your city</label>
    <input id="f-city" type="text" autocomplete="address-level2">
    <label for="f-zip">ZIP code (optional)</label>
    <input id="f-zip" type="text" autocomplete="postal-code">
    <label for="f-email">Email (optional, for the printed letter)</label>
    <input id="f-email" type="email" autocomplete="email">
    <label for="f-phone">Phone (optional, for the printed letter)</label>
    <input id="f-phone" type="tel" autocomplete="tel">
    <label for="f-reason">Why this matters to you, one line (for the call script)</label>
    <input id="f-reason" type="text" placeholder="a company's fine print took away my right to sue">
    <label for="f-ownwords">In your own words (for the letter): what happened, why you object. Your words, not ours.</label>
    <textarea id="f-ownwords" rows="5"></textarea>

    <div id="members-actions"></div>
  </section>

  ${DISCLAIMER}
`

// ---- element refs ----
const addrInput = app.querySelector('#addr')
const lookupBtn = app.querySelector('#lookup-btn')
const lookupStatus = app.querySelector('#lookup-status')
const manualDetails = app.querySelector('#manual-details')
const manualState = app.querySelector('#manual-state')
const manualDistrictWrap = app.querySelector('#manual-district-wrap')
const manualDistrict = app.querySelector('#manual-district')
const manualBtn = app.querySelector('#manual-btn')
const manualStatus = app.querySelector('#manual-status')
const resultsSection = app.querySelector('#results-section')
const resultsNote = app.querySelector('#results-note')
const resultsList = app.querySelector('#results-list')
const actionsSection = app.querySelector('#actions-section')
const membersActions = app.querySelector('#members-actions')

// ---- populate manual state select ----
for (const code of allStateCodes().sort((a, b) => STATE_NAMES[a].localeCompare(STATE_NAMES[b]))) {
  const opt = document.createElement('option')
  opt.value = code
  opt.textContent = STATE_NAMES[code]
  manualState.appendChild(opt)
}

manualState.addEventListener('change', async () => {
  lookupStatus.textContent = ''
  manualStatus.textContent = ''
  const state = manualState.value
  if (!state) {
    manualDistrictWrap.hidden = true
    return
  }
  try {
    const districts = await districtsForState(state)
    if (districts.length <= 1) {
      manualDistrictWrap.hidden = true
    } else {
      manualDistrictWrap.hidden = false
      manualDistrict.innerHTML = districts
        .map((d) => `<option value="${d}">District ${d}</option>`)
        .join('')
    }
  } catch (err) {
    manualStatus.textContent = 'Could not load the legislator data. Reload the page and try again.'
  }
})

manualBtn.addEventListener('click', async () => {
  lookupStatus.textContent = ''
  manualStatus.textContent = ''
  const state = manualState.value
  if (!state) {
    return
  }
  manualBtn.disabled = true
  try {
    const districts = await districtsForState(state)
    if (districts.length > 1 && (manualDistrict.options.length === 0 || manualDistrictWrap.hidden)) {
      // The district picker never got populated (e.g. the 'change' handler's
      // districtsForState() call failed earlier and this is a retry). Fill
      // it in and ask the user to choose instead of falling through to
      // parseInt('') below, which produces NaN and silently resolves the
      // wrong (or no) representative.
      manualDistrictWrap.hidden = false
      manualDistrict.innerHTML = districts
        .map((d) => `<option value="${d}">District ${d}</option>`)
        .join('')
      manualStatus.textContent = 'Choose your congressional district below, then click "Use this state" again.'
      return
    }
    const district = districts.length <= 1 ? (districts[0] ?? 0) : parseInt(manualDistrict.value, 10)
    await resolveMembers(state, district, {})
  } catch (err) {
    manualStatus.textContent = 'Could not load the legislator data. Reload the page and try again.'
  } finally {
    manualBtn.disabled = false
  }
})

// ---- address lookup ----
lookupBtn.addEventListener('click', async () => {
  const address = addrInput.value.trim()
  if (!address) {
    lookupStatus.textContent = 'Enter an address first.'
    return
  }
  lookupBtn.disabled = true
  lookupStatus.textContent = 'Looking up your district with the Census geocoder...'
  try {
    let result
    try {
      result = await geocodeAddress(address)
    } catch (err) {
      // A failure here is the geocoder's fault, not the legislator data's.
      const msg =
        err instanceof GeocodeError
          ? err.message
          : 'Something went wrong reaching the Census geocoder.'
      lookupStatus.textContent = `${msg} Pick your state below instead.`
      manualDetails.open = true
      return
    }
    if (!result) {
      lookupStatus.textContent =
        'The Census geocoder could not match that address. Try a fuller address (street, city, state, ZIP), or pick your state below.'
      manualDetails.open = true
      return
    }
    lookupStatus.textContent = `Matched: ${result.matchedAddress}`
    try {
      // Geocoding already succeeded here; a failure past this point is the
      // legislator data failing to load, not the geocoder, so use a
      // distinct message that does not misattribute the cause.
      await resolveMembers(result.state, result.district ?? 0, { city: result.city, zip: result.zip })
    } catch (err) {
      lookupStatus.textContent = 'Could not load the legislator data. Reload the page and try again.'
    }
  } finally {
    lookupBtn.disabled = false
  }
})

// ---- state ----
const membersById = new Map()

function partyLine(term) {
  return term.party || 'party not on file'
}

function memberWebform(term) {
  return term.contact_form || term.url || ''
}

function renderMemberSummaryCard(entry) {
  const { member, term, title } = entry
  const name = displayName(member)
  const phone = term.phone || ''
  const webform = memberWebform(term)
  return `
    <div>
      <h3>${title} ${name}</h3>
      <p>${partyLine(term)}${term.type === 'rep' && term.district ? ` &middot; district ${term.district}` : ''}</p>
      <p>
        ${phone ? `Phone: <a href="tel:${phone}">${phone}</a>` : 'No phone on file'}
        ${webform ? ` &middot; <a href="${webform}" target="_blank" rel="noopener">website / webform</a>` : ''}
      </p>
    </div>
  `
}

async function resolveMembers(state, district, extra) {
  const senators = hasSenators(state) ? await senatorsFor(state) : []
  const repEntry = await representativeFor(state, district)

  membersById.clear()
  const entries = []
  for (const s of senators) {
    entries.push({ ...s, title: memberTitle(state, 'sen') })
  }
  if (repEntry) {
    entries.push({ ...repEntry, title: memberTitle(state, 'rep') })
  }
  for (const e of entries) membersById.set(e.member.id.bioguide, e)

  // Results note: territory/DC, missing-district, and at-large framing.
  const stateName = STATE_NAMES[state] || state
  let note = ''
  let scrollToManual = false
  if (senators.length === 0) {
    const t = entries.find((e) => e.term.type === 'rep')
    const title = t ? t.title : 'Delegate'
    note = `<p class="disclaimer">As a resident of ${stateName}, you have a non-voting ${title} in the House and no U.S. Senators. Non-voting members can still cosponsor and speak on bills, so it is still worth asking.</p>`
  } else if (!repEntry) {
    note = `<p class="disclaimer">We could not determine your congressional district, so your U.S. representative is not shown below (your senators are). Use the district picker above to select your district manually and find your representative.</p>`
    manualDetails.open = true
    manualState.value = state
    manualState.dispatchEvent(new Event('change'))
    scrollToManual = true
  } else if (repEntry.term.district === 0) {
    note = `<p class="disclaimer">${stateName} elects one representative at-large; there are no numbered districts.</p>`
  }
  resultsNote.innerHTML = note
  resultsList.dataset.state = state

  if (entries.length === 0) {
    resultsList.innerHTML = `<p>No members found for ${stateName}${district ? `, district ${district}` : ''}. Double-check the state and district, or use the house.gov finder linked above.</p>`
  } else {
    resultsList.innerHTML = entries.map(renderMemberSummaryCard).join('<hr>')
  }

  renderMemberActions(entries, extra)

  resultsSection.hidden = false
  actionsSection.hidden = false
  // If the representative could not be resolved, the picker the user needs
  // to act on (#manual-details) sits above #results-section in the DOM, so
  // scrolling to the results would push it off-screen.
  const scrollTarget = scrollToManual ? manualDetails : resultsSection
  scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ---- step 3: per-member actions ----
function getFormValues() {
  return {
    name: app.querySelector('#f-name').value.trim(),
    street: app.querySelector('#f-street').value.trim(),
    city: app.querySelector('#f-city').value.trim(),
    zip: app.querySelector('#f-zip').value.trim(),
    email: app.querySelector('#f-email').value.trim(),
    phone: app.querySelector('#f-phone').value.trim(),
    reason: app.querySelector('#f-reason').value.trim(),
    ownWords: app.querySelector('#f-ownwords').value.trim()
  }
}

function todayLong() {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

async function copyToClipboard(text, statusEl) {
  try {
    await navigator.clipboard.writeText(text)
    statusEl.textContent = 'Copied to clipboard.'
  } catch {
    statusEl.textContent = 'Could not copy automatically. Select the text below and copy it (Cmd/Ctrl+C).'
  }
  setTimeout(() => {
    statusEl.textContent = ''
  }, 4000)
}

function renderMemberActions(entries, extra) {
  if (entries.length === 0) {
    membersActions.innerHTML = ''
    return
  }
  membersActions.innerHTML = entries
    .map((entry) => {
      const id = entry.member.id.bioguide
      const name = displayName(entry.member)
      const officialUrl = entry.term.url || entry.term.contact_form || ''
      return `
        <div class="member-action" data-bioguide="${id}">
          <h3>${entry.title} ${name}</h3>
          <div style="display:flex; gap:0.6rem; flex-wrap:wrap;">
            <button type="button" data-action="call">Copy call script</button>
            <button type="button" data-action="letter-copy">Copy letter text</button>
            <button type="button" data-action="letter-pdf" class="primary">Download letter PDF</button>
          </div>
          <p class="field-help">
            If you download the letter PDF, mail it to the district office nearest
            you.${officialUrl ? ` Office addresses are listed on the official website: <a href="${officialUrl}" target="_blank" rel="noopener">${officialUrl}</a>.` : ''}
          </p>
          <p class="action-status" style="min-height:1.4em; font-size:0.85rem; color:var(--muted);"></p>
          <textarea class="preview" rows="6" readonly style="display:none;"></textarea>
        </div>
      `
    })
    .join('<hr>')

  if (extra && extra.city) app.querySelector('#f-city').value = extra.city
  if (extra && extra.zip) app.querySelector('#f-zip').value = extra.zip
}

membersActions.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]')
  if (!button) return
  const card = button.closest('.member-action')
  const bioguide = card.getAttribute('data-bioguide')
  const entry = membersById.get(bioguide)
  if (!entry) return

  const statusEl = card.querySelector('.action-status')
  const previewEl = card.querySelector('.preview')
  const values = getFormValues()
  const lastName = entry.member.name.last

  if (button.dataset.action === 'call') {
    if (!values.name || !values.city || !values.reason) {
      statusEl.textContent = 'Fill in your name, city, and reason above first.'
      return
    }
    const text = callScript({
      name: values.name,
      city: values.city,
      title: entry.title,
      lastName,
      reason: values.reason
    })
    previewEl.value = text
    previewEl.style.display = 'block'
    await copyToClipboard(text, statusEl)
    return
  }

  if (button.dataset.action === 'letter-copy' || button.dataset.action === 'letter-pdf') {
    if (!values.name || !values.city || !values.ownWords) {
      statusEl.textContent = 'Fill in your name, city, and "in your own words" above first.'
      return
    }
    const blocks = letterBlocks({
      date: todayLong(),
      fullName: values.name,
      memberName: displayName(entry.member),
      street: values.street,
      city: values.city,
      state: resultsList.dataset.state || '',
      zip: values.zip,
      email: values.email,
      phone: values.phone,
      title: entry.title,
      lastName,
      ownWords: values.ownWords
    })

    if (button.dataset.action === 'letter-copy') {
      const text = blocksToPlainText(blocks)
      previewEl.value = text
      previewEl.style.display = 'block'
      await copyToClipboard(text, statusEl)
    } else {
      // pdf-lib's standard fonts only support the WinAnsi character set.
      // Check the user-supplied text before generating so we can tell them
      // exactly which character is the problem instead of a generic
      // "could not generate" message that misattributes the cause and
      // sends them into a retry that can never succeed.
      const badChars = []
      for (const value of [
        values.name,
        values.street,
        values.city,
        values.zip,
        values.email,
        values.phone,
        values.ownWords
      ]) {
        for (const ch of findUnsupportedPdfChars(value)) {
          if (!badChars.includes(ch)) badChars.push(ch)
        }
      }
      if (badChars.length) {
        statusEl.textContent =
          `The letter PDF can't render: ${badChars.join(' ')}. Remove or replace ` +
          'that character in your name, address, or "in your own words" text above, ' +
          'or use the copy option instead, which works with any character.'
        return
      }

      statusEl.textContent = 'Generating PDF...'
      const safeLast = (lastName || 'member').toLowerCase().replace(/[^a-z0-9]+/g, '-')
      try {
        await downloadLetterPdf(blocks, `letter-congress-${safeLast}`)
        statusEl.textContent = 'PDF downloaded.'
      } catch (err) {
        statusEl.textContent = 'Could not generate the PDF. Try the copy option instead.'
      }
      setTimeout(() => {
        statusEl.textContent = ''
      }, 4000)
    }
  }
})
