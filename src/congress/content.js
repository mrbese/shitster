// Fixed skeletons. Only the free-text fields (name, city, reason, own-words
// paragraph) vary; the argument itself is not paraphrased per member.

export const FAIR_ACT_NAME = 'the FAIR Act (Forced Arbitration Injustice Repeal Act)'

// Call script, per SPEC-CONGRESS.md. [blank] is the caller's own reason.
export function callScript({ name, city, title, lastName, reason }) {
  const n = name || '[your name]'
  const c = city || '[your city]'
  const r = reason || '[your reason]'
  return (
    `Hi, my name is ${n}, I'm a constituent from ${c}. I'm calling to ask ` +
    `${title} ${lastName} to cosponsor the FAIR Act, which ends forced ` +
    `arbitration in consumer contracts. Companies put clauses in contracts ` +
    `nobody can negotiate that erase the right to go to court, and recently ` +
    `they've added rules that make their liability shrink as the number of ` +
    `people they harm grows. It matters to me because ${r}. Congress carved ` +
    `out sexual assault claims in 2022, so it can do this. Will the ${title} ` +
    `cosponsor? Thank you.`
  )
}

// Builds the letter as a sequence of typed blocks so the same content can
// drive both a plain-text (webform-paste) rendering and the PDF layout.
// Types: 'line' (single line, no wrap), 'para' (wraps), 'label' (bold line),
// 'space' (blank line).
export function letterBlocks({
  date,
  fullName,
  memberName,
  street,
  city,
  state,
  zip,
  email,
  phone,
  title,
  lastName,
  ownWords
}) {
  const cityState = [city, state].filter(Boolean).join(', ') || '[your city and state]'
  const addressLine = [street, [city, state, zip].filter(Boolean).join(' ')]
    .filter(Boolean)
  const contactLine = [email, phone].filter(Boolean).join('   ')

  const blocks = [
    { type: 'line', text: date },
    { type: 'space' },
    { type: 'line', text: `The Honorable ${memberName || `${title} ${lastName}`}` },
    { type: 'space' },
    {
      type: 'label',
      text: `RE: Please cosponsor the FAIR Act (Forced Arbitration Injustice Repeal Act)`
    },
    { type: 'space' },
    { type: 'line', text: `Dear ${title} ${lastName}:` },
    { type: 'space' },
    {
      type: 'para',
      text: `I am a constituent writing from ${cityState}. I am asking you to cosponsor the FAIR Act, which would make pre-dispute arbitration clauses unenforceable in consumer contracts.`
    },
    { type: 'space' },
    {
      type: 'para',
      text: `Companies routinely put arbitration clauses in contracts that consumers cannot negotiate and rarely get to read closely. Those clauses take away the right to go to court and move disputes into a forum the company chose. Some companies have gone further, writing rules that shrink their own liability, per claim, as the number of people they harm grows, by batching mass filings so the company's share of the fees drops the more people who file. That is not a technicality. It is the drafter of the contract writing itself a discount on the harm it caused.`
    },
    { type: 'space' },
    { type: 'label', text: 'IN MY OWN WORDS' },
    { type: 'para', text: ownWords || '[not provided]' },
    { type: 'space' },
    {
      type: 'para',
      text: `Congress has already done this once. The Ending Forced Arbitration of Sexual Assault and Sexual Harassment Act of 2022 removed forced arbitration for those claims, with bipartisan support. The FAIR Act extends the same principle to consumer and employment disputes generally.`
    },
    { type: 'space' },
    {
      type: 'para',
      text: `I am asking you to cosponsor the FAIR Act. Thank you for your time and your service.`
    },
    { type: 'space' },
    { type: 'line', text: 'Sincerely,' },
    { type: 'space' },
    { type: 'line', text: fullName }
  ]

  for (const line of addressLine) blocks.push({ type: 'line', text: line })
  if (contactLine) blocks.push({ type: 'line', text: contactLine })

  return blocks
}

export function blocksToPlainText(blocks) {
  return blocks.map((b) => (b.type === 'space' ? '' : b.text)).join('\n')
}
