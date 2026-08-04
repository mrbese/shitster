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
        In December 2023, BMW's senior vice president for connected experience,
        Stephan Durach, said on record that BMW would not sell in-car screen
        space to play a commercial, calling the car a private space. The
        contract those owners already signed does not obviously permit what
        happened. Section 33 of the ConnectedDrive Terms governs dashboard
        communication, authorizing messages to inform owners "about Services,
        trials, expirations, renewals, or other messages, as applicable,"
        which is to say, matters related to the Services. A movie studio's
        promotional content is not that. Section 31.c permits BMW to use
        collected information to "provide relevant in-car or in-app
        information, businesses, locations, advertising, and other purposes."
        That is a real sentence in the Terms, word for word, including
        "advertising," and it is worth reading in full rather than around.
        But it governs how BMW may use information it collects about you. It
        is not a grant of authority over the dashboard display itself, that
        is Section 33's job, and no provision of the Terms authorizes turning
        a vehicle's primary control interface into a promotional surface for
        a third party's film.
      </p>
      <p>
        This site is not built on a claim that the ad was undismissable, or that
        BMW charged anyone for it, or that BMW was paid for the promotion.
        None of those is true, or established, and none is the point. The
        point is narrower and, we think, harder to argue with: BMW put
        third-party promotional content on a screen it told the public
        would stay private, on cars people already own, under a contract that
        does not say it can.
      </p>
    </section>

    <section>
      <h2>Too dangerous for your apps, safe enough for their ads.</h2>
      <p>
        Regulators, the European Union loudest among them, now require the
        most personal device you own to accept third-party software: app
        stores must open, interfaces must interoperate, gatekeepers must let
        rivals in. Car dashboards got the opposite treatment. No regulation
        requires an automaker to decouple the infotainment surface from the
        vehicle's utility functions or to let software the automaker did not
        bless run on it, and the stated reason is safety. BMW alone decides
        what runs on iDrive.
      </p>
      <p>
        Then BMW ran a film studio's promotion on that same surface, in more
        than 70 countries, including the ones whose regulators wrote the
        safety rationale, including Germany. So the closed dashboard is now
        the monetized dashboard, and the safety argument is doing double duty
        as a business model. If the screen is too safety-critical to open to
        your software, it is too safety-critical to rent to a film studio.
        Pick one.
      </p>
    </section>

    <section>
      <h2>Two systems, one ad.</h2>
      <p>
        The same startup banner reached Munich and Michigan. What owners can do
        about it splits at the border.
      </p>
      <p>
        In the United States, the arbitration clause holds. The legislative fix,
        the FAIR Act, passed the House in March 2022, died in the Senate, and
        has been reintroduced ever since; it is pending right now as S.2799 and
        H.R.5350. The only carve-out Congress has actually enacted protects
        sexual assault and harassment claims (2022). Until that changes, the
        strongest American moves are individual and procedural: the
        <a href="bmw.html">Section 30.A notice</a>, the
        <a href="optout.html">30-day opt-out</a> if you are a new owner, and
        <a href="congress.html">telling your member of Congress</a> to pass the
        FAIR Act.
      </p>
      <p>
        In the European Union, the wall Americans hit does not exist. Directive
        93/13 treats contract terms that hinder your right to sue, including
        boilerplate arbitration clauses, as presumptively unfair. German law
        goes further: an arbitration agreement with a consumer must be its own
        separately signed document (ZPO section 1031(5)), so a clause buried in
        sales terms does not bind you. Germany has had a real collective
        redress action since October 2023, the Abhilfeklage, and the federal
        consumer association has already used it. And UWG section 7 prohibits
        advertising that intrudes into your private sphere against your
        recognizable wishes, which is a strikingly literal description of a
        movie ad on a dashboard its maker publicly called a private space.
      </p>
      <p>
        Here is what surprised us: a week into the campaign, no European
        consumer body, regulator, or politician had moved. All the visible
        anger was owners and journalists. Europeans hold the better cards and,
        so far, nobody is playing them. If you are a European BMW owner, your
        consumer association can act where you cannot: write to them (in
        Germany, the vzbv and your regional Verbraucherzentrale). If a
        qualified entity takes this up anywhere in Europe, we will link it
        here.
      </p>
      <p>
        Americans got the ad and kept the arbitration clause. Europeans got the
        ad and kept their courts. Only one of those groups needs a letter
        generator, and that is why this site exists.
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
