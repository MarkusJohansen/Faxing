import { HONOUR_GLYPH, HONOUR_LABEL, type Honour } from '../lib/honours'

/** The mark of an honoured person: a glyph and a word, so colour is not the only signal. */
export default function HonourMark({ honour }: { honour: Honour | undefined }) {
  if (!honour) return null
  return <span className={`honour-mark honour-${honour}`} title={HONOUR_LABEL[honour]}><span aria-hidden="true">{HONOUR_GLYPH[honour]}</span> {HONOUR_LABEL[honour]}</span>
}
