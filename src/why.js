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
        Asked about the campaign, a BMW spokesperson told Kotaku: "The Festive
        App in the BMW operating system is designed to provide customers with
        optional themed animations and messages linked to a range of global
        and local occasions. It is not a form of advertising." Note what the
        animation actually does: it ends with a QR code and a note that the
        film is in cinemas. So the company's position is that a promotion for
        a film, closing on a scannable link to the film while the film is in
        theaters, delivered under a film partnership Deadline valued at 309
        million dollars in media value, is not a form of advertising. We are
        content to let that sentence argue with itself. And on the money: we
        make no claim that cash moved for the banner. We do not need to. The
        same partnership that put BMW's cars in the film put the film in
        BMW's cars. If that exchange had no commercial value to either side,
        two marketing departments have some explaining to do.
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
      <h2>There is no off switch.</h2>
      <p>
        We checked, so you do not have to. The marketing toggles in the My BMW
        app and the iDrive privacy menus govern email, mail, and push
        notifications, not the Control Display. No BMW document describes a way
        to disable in-car promotional banners. When a reporter asked BMW
        directly whether owners could opt out, the spokesperson did not answer.
        A company that calls a promotion optional, asked how to decline the
        next one, went quiet. That is what the notice of dispute is for.
      </p>
      <p>
        One open question matters here: nobody has documented whether owners
        who had already switched off every marketing consent still received
        the banner. If that was you, your letter should say so.
      </p>
    </section>

    <section>
      <h2>The legal basis, in plain terms.</h2>
      <p>
        Three things BMW did, and what each one gives an owner to work with.
      </p>
      <p>
        <strong>They went outside their own contract.</strong> Section 33 is
        the provision that governs what appears on the dashboard, and it
        authorizes messages about "Services, trials, expirations, renewals, or
        other messages, as applicable." A film studio's promotion is none of
        those. That is the breach-of-contract claim.
      </p>
      <p>
        <strong>They broke a public promise.</strong> A named BMW executive
        said, on the record in December 2023, that BMW would not sell in-car
        screen space to play a commercial, calling the car a private space.
        Owners bought and leased cars with that statement in the world. The gap
        between what a company tells the public and what it then does is
        exactly what state consumer-protection statutes exist for, starting
        with the New Jersey Consumer Fraud Act, the law of the state BMW's own
        Terms choose.
      </p>
      <p>
        <strong>They wrote a process, and now they owe it.</strong> Section
        30.A says that after an owner sends a notice of dispute by certified
        mail, BMW must "personally meet and confer, via telephone or
        videoconference" within 30 days of receiving it. Yes: their contract
        obligates them to call you back. It also says multiple individuals
        cannot share one conference, tolls the statute of limitations while
        the process runs, and opens the door to AAA arbitration or small
        claims court if nothing is resolved within 60 days of sending. None
        of this is our invention. It is their drafting, read carefully, used
        as written. The one-year deadline in Section 28.f is the reason to
        use it now rather than later.
      </p>
      <p>
        There are also fronts this site does not press, because they belong to
        regulators rather than owners. The FTC and the New Jersey Attorney
        General fined Vizio 2.2 million dollars in 2017 for turning connected
        screens in private living rooms into ad and tracking surfaces without
        opt-in consent, a precedent that reads uncomfortably well onto a
        connected dashboard. NHTSA's driver-distraction guidelines advise
        against exactly this kind of startup-moment visual bait. Those cases
        are agencies' to bring. The notice is yours.
      </p>
    </section>

    <section>
      <h2>We are playing their game.</h2>
      <p>
        The word salad is deliberate. Call it a Festive App and maybe it is not
        marketing. Call it a partnership and maybe nobody "sold" anything. This
        is loophole engineering, and it has been practiced on consumers at
        scale for decades: the arbitration clause, the class waiver, the
        pre-expired opt-out window, the batch discount. shitster's answer is
        not to complain about the game from outside it. It is to read the
        rulebook they wrote and play it back.
      </p>
      <p>
        Example. The individual conference requirement in Section 30.A, the
        obligation to "personally meet and confer" with every owner
        separately, no shared conferences allowed, is brand new. They added
        it in the January 2026 revision of the Terms, months before this
        campaign; the October 2023 version had no conference requirement at
        all.
        Probably it was added to prevent pooled attacks: to make sure no law
        firm can herd ten thousand claims through one phone call, to atomize
        any crowd back into individuals. We say probably because we can read
        their drafting, not their minds. Fine. Atomized is exactly how we
        arrive: one owner, one certified letter, one conference, times
        everyone who is angry. The clause they wrote to make collective action
        slow now obligates them to take every one of those calls.
      </p>
      <p>
        They did not sell the screen. They swapped it. To swap something you
        first have to decide what it is worth, and BMW decided what its
        customers' private space was worth: one movie placement. The
        compensation was not cash; a placement is non-cash material
        compensation, the kind accounting standards and the FTC's endorsement
        rules have recognized as payment for decades. Their words, their
        contract, their game. We are finally playing it too.
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
      <p>
        The timing makes the contradiction literal. The EU's General Safety
        Regulation requires new vehicles to carry driver-distraction
        monitoring systems as of July 2026, the same month this campaign
        started swinging Spider-Man across control displays. One arm of the
        system is legally required to watch your eyes for distraction. The
        other arm is supplying it.
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
        European regulators have even answered the threshold question already:
        the EDPB's connected-vehicle guidelines classify a car as "terminal
        equipment" under the ePrivacy Directive, the same protected category
        as your laptop or phone, where storing content on the device or
        accessing it requires prior consent unless strictly necessary for a
        service you requested. A film promotion pushed into a car's storage is
        strictly necessary for nothing.
      </p>
      <p>
        And one market got neither the ad nor the argument. The Telegraph
        reported that the animation was not made available to UK owners at
        all. BMW has not said why. Commentators point at a specific stack of
        UK law: PECR, under which the ICO treats a connected car as terminal
        equipment and which, since the Data (Use and Access) Act 2025,
        carries fines up to 17.5 million pounds or 4 percent of global
        turnover; the DMCCA 2024, which gave the CMA direct fining powers
        over aggressive commercial practices; an advertising regulator that
        banned a BMW ad as recently as February 2024; and the Consumer Rights
        Act 2015, which treats the car's software as digital content that
        updates may not degrade. We cannot verify the motive, only the
        choice. A company that calls something a gift does not usually skip
        the house with the strictest gift inspection.
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
          Run the arithmetic on the batches. Up to one hundred demands per
          batch, grouped by state of residence, one set of filing fees per
          batch. Harm 90 people in one state: one batch. Harm 190 there: two.
          In between, nothing moves. The 101st person BMW wrongs in that state
          costs it a new set of fees, and persons 102 through 200 cost it
          nothing at all. Under this clause, the marginal price of wronging
          another hundred people is zero. Sharper still: a hundred owners who
          each arbitrated alone would cost BMW a hundred sets of fees. The
          same hundred, batched under Section 30.D, can cost one. The crowd
          itself is the discount. A company that harms more people faces less
          exposure per person, by design, in a document the company wrote.
        </p>
        <p>
          Courts police this only by degree. Verizon's batches of ten,
          processed one at a time, were struck down. Ticketmaster's bespoke
          mass-arbitration protocol was struck down. So BMW drafted one
          hundred, in parallel, with tolling, calibrated to survive. We think
          the degree is not the defect. If a batch of ten thousand would be
          void because it extinguishes claims, a batch of one hundred is the
          same mechanism at a politer volume. The answer should be one or
          zero, not a number a defense lawyer tunes annually to sit just under
          whatever the last court tolerated. Justice Kagan described where
          this design ends in her 2013 dissent in American Express v. Italian
          Colors: an arbitration clause built this way is "a foolproof way of
          killing off valid claims." Her summary of the majority's response:
          "Too darn bad." That has been the law since. This site is what
          working inside that law looks like.
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
        <p>
          The deeper problem with unilateral revision is what it does to the
          baseline. Every version we accept becomes the floor the next version
          is measured against. In 2011 the class-action waiver was the
          aggressive novelty; it is now boilerplate nobody blinks at. The mass
          action waiver arrived next, then batching. If batches of 100 hold,
          nothing stops the next revision from trying 250, and the revision
          after that from measuring itself against 250 instead of against
          zero. The psychology is ordinary normalization: no single step ever
          feels worth fighting, and the total distance traveled never appears
          on any page you signed. Milgram's subjects were never asked to
          throw the 450-volt switch first. They were asked for fifteen more
          volts than last time, every time. Contract drafting by annual
          increment works on the same principle, and the only known defense
          is the same in both cases: someone has to refuse a step that looks,
          in isolation, too small to refuse.
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
