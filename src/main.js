import { BRAND } from './shared/brand.js'
import { mountChrome, fetchCount } from './shared/ui.js'

mountChrome()

const app = document.getElementById('app')

app.innerHTML = `
  <style>
    .subhead { font-size: 1.15rem; color: var(--muted); max-width: 38rem; }
    .counter-block {
      border: 1.5px solid var(--line); padding: 1.25rem 1.5rem; margin: 2.25rem 0;
    }
    .counter-block .counter { font-size: 1.35rem; display: block; margin-bottom: 0.6rem; }
    .counter-note { color: var(--muted); font-size: 0.95rem; margin: 0; }
    .cards {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
      gap: 1rem; margin: 2.25rem 0;
    }
    .card {
      display: block; border: 1.5px solid var(--line); padding: 1.25rem 1.4rem;
      text-decoration: none; color: var(--ink);
    }
    .card:hover { border-color: var(--accent); }
    .card h2 {
      font-size: 1.05rem; margin: 0 0 0.4rem; text-decoration: underline;
      text-decoration-color: var(--accent); text-decoration-thickness: 2px;
    }
    .card p { margin: 0; color: var(--muted); font-size: 0.95rem; }
    .how {
      border-top: 1px solid var(--line); padding-top: 1.5rem; margin-top: 2.5rem;
    }
    .how h3 {
      font-family: var(--mono); font-size: 0.8rem; text-transform: uppercase;
      letter-spacing: 0.06em; color: var(--muted); margin: 0 0 0.6rem;
    }
    .how p { margin: 0; }
  </style>

  <h1>${BRAND.tagline}</h1>
  <p class="subhead">
    BMW put a movie ad on the dashboard of cars people own. Their contract bans
    class actions. It does not ban 5,000 individual notices. This site helps you
    send yours.
  </p>

  <section class="counter-block">
    <span class="counter" id="counter-line">Loading count...</span>
    <p class="counter-note">
      Section 30.A entitles every claimant to their own Pre-Arbitration Informal
      Dispute Resolution conference, by phone or videoconference, and it says
      plainly that multiple people cannot share one. BMW cannot batch this step
      the way it can batch arbitration demands. Every notice generated here is
      one more individual conference BMW has to schedule, one owner at a time.
    </p>
  </section>

  <section class="cards">
    <a class="card" href="bmw.html">
      <h2>Send BMW a notice of dispute.</h2>
      <p>10 minutes.</p>
    </a>
    <a class="card" href="optout.html">
      <h2>Just bought a BMW?</h2>
      <p>Opt out of arbitration. 30-day window.</p>
    </a>
    <a class="card" href="congress.html">
      <h2>Tell Congress to end forced arbitration.</h2>
      <p>2 minutes.</p>
    </a>
  </section>

  <section class="how">
    <h3>How this works</h3>
    <p>
      Prepared in your browser. Sent by you. Stored nowhere.
      The tool prepares, the human acts.
    </p>
  </section>
`

const counterLine = document.getElementById('counter-line')
fetchCount().then((count) => {
  if (count === null) {
    counterLine.textContent = 'Count unavailable right now. Goal 5,000.'
    return
  }
  const noun = count === 1 ? 'notice' : 'notices'
  counterLine.textContent = `${count.toLocaleString('en-US')} ${noun} generated. Goal 5,000.`
})
