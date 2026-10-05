import { messages, type Locale } from '../lib/i18n';

export function Brand({ locale }: { locale: Locale }) {
  return <a className="brand" href="/dashboard"><span className="brand-word" data-text={`${messages[locale].brand}.`}>{messages[locale].brand}<span className="brand-dot">.</span></span><span className="brand-caption">MONEY KEEPS THE BEAT / 174</span></a>;
}
export function BeatStrip() {
  return <div className="beat-strip" aria-hidden="true"><span>01 / 16</span><div className="sequencer">{Array.from({ length: 16 }, (_, index) => <i key={index} style={{ animationDelay: `${index * .115}s` }} />)}</div><span>174 BPM</span></div>;
}
