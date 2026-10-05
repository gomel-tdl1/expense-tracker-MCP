// These are typographic monograms, not official retailer logos.
const chains = [
  { pattern: /^żabka(?:\s|$|[.#-])/iu, initials: 'Ż', tone: 0 },
  { pattern: /^zabka(?:\s|$|[.#-])/iu, initials: 'Ż', tone: 0 },
  { pattern: /^biedronka(?:\s|$|[.#-])/iu, initials: 'B', tone: 3 },
  { pattern: /^lidl(?:\s|$|[.#-])/iu, initials: 'L', tone: 2 },
  { pattern: /^orlen(?:\s|$|[.#-])/iu, initials: 'O', tone: 3 },
  { pattern: /^bp(?:\s|$|[.#-])/iu, initials: 'BP', tone: 0 },
];
export function merchantIdentity(merchant: string | null) {
  const name = merchant?.trim() ?? '';
  if (!name) return { initials: '↗', tone: 0 };
  const known = chains.find(({ pattern }) => pattern.test(name));
  if (known) return { initials: known.initials, tone: known.tone };
  const words = name.split(/\s+/u);
  const initials = words.slice(0, 2).map(word => Array.from(word)[0]).join('').toLocaleUpperCase('pl-PL');
  const hash = Array.from(name.toLocaleLowerCase('pl-PL')).reduce((value, char) => (value * 31 + char.codePointAt(0)!) >>> 0, 0);
  return { initials, tone: hash % 4 };
}
