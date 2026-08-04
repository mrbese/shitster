import { BRAND } from './shared/brand.js'
import { mountChrome } from './shared/ui.js'

mountChrome()

const app = document.getElementById('app')

const DISCLAIMER = `This is a self-help template, not legal advice, and no attorney-client
relationship exists. You are acting individually, in your own name. Read what you sign.
If your situation is unusual, talk to a lawyer.`

app.innerHTML = `
  <style>
    .why-prose h2 { margin-top: 2.75rem; font-size: 1.4rem; }
    .why-prose h2 .num {
      display: block; font-family: var(--mono); font-size: 0.78rem; color: var(--muted);
      text-transform: uppercase; letter-spacing: 0.06em; font-weight: 400; margin-bottom: 0.4rem;
    }
    .why-prose p { margin: 1rem 0; }
    .why-prose section { margin-bottom: 2.5rem; }
    .why-prose .principle { border-left: 3px solid var(--accent); padding-left: 1.1rem; }
    .cta-row { margin-top: 2.5rem; }
    .disclaimer { white-space: pre-line; }
  </style>

  <h1>Why ${BRAND.campaign} exists</h1>

  <div class="why-prose">

    <section>
      <p>
        Between July 27 and August 10, 2026, BMW delivered a full-screen
        promotional experience for the Sony Pictures film "Spider-Man: Brand New
        Day" to the iDrive Control Display of customer vehicles. It appeared as a
        banner on start, on cars people own or lease, running OS 7, 8, 8.5, 9, or
        X, built after July 2020.
      </p>
      <p>
        BMW has previously and publicly described the Control Display as a
        private space, one that would not become an advertising surface. The
        contract those owners already signed does not obviously permit what
        happened. Section 33 of the ConnectedDrive Terms authorizes dashboard
        communication to inform owners "about Services, trials, expirations,
        renewals, or other messages, as applicable," which is to say, matters
        related to the Services. A movie studio's promotional content is not
        that. Section 31.c authorizes use of collected information to provide
        "relevant in-car or in-app information," and a movie studio's
        promotional banner is not relevant in-car information under any
        ordinary reading of that phrase.
      </p>
      <p>
        This site is not built on a claim that the ad was undismissable, or that
        BMW charged anyone for it. Neither is true, and neither is the point.
        The point is narrower and, we think, harder to argue with: BMW put
        paid third-party promotional content on a screen it told the public
        would stay private, on cars people already own, under a contract that
        does not say it can.
      </p>
    </section>

    <section>
      <h2><span class="num">Principle one</span>Liability should not shrink as harm scales.</h2>
      <div class="principle">
        <p>
          The same Terms that require an individual conference for every notice
          of dispute (Section 30.A) also let BMW batch arbitration demands once
          they are filed: Section 30.D groups demands 100 to a batch, one set of
          filing fees per batch. Filing fees are volume-priced for BMW. An
          individual conference is not.
        </p>
        <p>
          Ordinarily, a company that harms more people faces more liability, not
          less per person. A discount that gets steeper the more people BMW has
          harmed runs the logic backward. It rewards scale of harm with scale of
          savings, on the defendant's side only.
        </p>
      </div>
    </section>

    <section>
      <h2><span class="num">Principle two</span>The drafter of the rules cannot be their beneficiary.</h2>
      <div class="principle">
        <p>
          BMW wrote these Terms, and it can update them unilaterally. It also
          wrote the one clause that lets an owner escape the arbitration
          requirement entirely: Section 30.B, the opt-out. But that opt-out
          window is only open for 30 days from the earlier of accepting the
          Terms or the date a person first agreed to any BMW NA agreement with
          an arbitration clause, which for almost every existing owner was
          years ago. The exit door was built, then quietly locked before most
          people who might need it ever knew there was a door.
        </p>
        <p>
          A party that writes its own rules, changes them at will, and controls
          when the one path out of them closes is not a neutral author. It is
          a party litigating its own terms in advance, in its own favor,
          before any dispute exists.
        </p>
      </div>
    </section>

    <section>
      <h2><span class="num">Principle three</span>Aggregation for me but not for thee is not procedure, it is immunity.</h2>
      <div class="principle">
        <p>
          The Terms waive the owner's right to bring or join a class action.
          At the same time, they let BMW batch the arbitration demands filed
          against it, 100 at a time, into single administrative units. Owners
          are barred from aggregating their claims. BMW is permitted to
          aggregate its defense of them. The same act, aggregation, is
          forbidden on one side of the table and built into the process on
          the other.
        </p>
        <p>
          Courts have started to notice this asymmetry when it gets extreme.
          In <em>Heckman v. Live Nation Entertainment</em>, the Ninth Circuit
          found a mass-arbitration protocol unconscionable in part because it
          let the drafting party rewrite the rules and strip claimants of
          normal procedural protections after the fact. In <em>MacClelland v.
          Cellco Partnership</em>, a federal court found a similar batching
          scheme unconscionable for shifting costs and control onto claimants
          in ways an individual arbitration agreement was never meant to
          produce. Aggregation is not the problem. One-sided aggregation is.
        </p>
      </div>
    </section>

    <section>
      <h2><span class="num">What this site does, and refuses to do</span>Publisher, not administrator.</h2>
      <div class="principle">
        <p>
          This site prepares documents in your browser. It does not file, send,
          submit, schedule, or track anything on your behalf, and it does not
          store anything you type. You mail your own letter, you place your
          own call, you send your own form. The tool prepares, the human acts.
        </p>
        <p>
          It also will not build features to help anyone evade a legitimate
          process, and it will not automate calls or messages aimed at
          anyone's phone lines. Congress and BMW's customer relations line
          both deserve to hear from real people, not scripts running on a
          timer. Every action this site prepares still requires a human
          being to decide to send it.
        </p>
      </div>
    </section>

    <section>
      <h2><span class="num">The fix that would make this unnecessary</span>The FAIR Act.</h2>
      <div class="principle">
        <p>
          The Forced Arbitration Injustice Repeal Act would make pre-dispute
          arbitration clauses unenforceable in consumer, employment, antitrust,
          and civil rights cases, which means the Section 30 that this whole
          site is built around would stop being enforceable against people who
          never really agreed to it in any meaningful sense.
        </p>
        <p>
          This is not a hypothetical ask. In 2022, Congress passed a narrower
          version of exactly this fix, the Ending Forced Arbitration of Sexual
          Assault and Sexual Harassment Act, carving those claims out of forced
          arbitration entirely, with bipartisan support. Congress has already
          proven it can do this. It has just not done it for everything else.
        </p>
        <p class="cta-row">
          <a class="btn primary" href="congress.html">Tell Congress to cosponsor the FAIR Act</a>
        </p>
      </div>
    </section>

  </div>

  <div class="disclaimer">${DISCLAIMER}</div>
`
