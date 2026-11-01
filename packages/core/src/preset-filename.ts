/** Portable ASCII basename; user-visible names and preset IDs stay untouched. */
export function presetBasename(name: string) {
  const latin: Record<string, string> = {
    ł: 'l',
    ø: 'o',
    æ: 'ae',
    œ: 'oe',
    ß: 'ss',
    đ: 'd',
    ð: 'd',
    þ: 'th',
  };
  let base = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[łøæœßđðþ]/gu, (letter) => latin[letter]!)
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '');
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/u.test(base))
    base = `preset-${base}`;
  return base.slice(0, 180).replace(/-+$/u, '') || 'preset';
}
export function presetFilename(name: string, occupied: ReadonlySet<string>) {
  const base = presetBasename(name);
  const lower = new Set([...occupied].map((file) => file.toLowerCase()));
  let file = `${base}.json`;
  for (let number = 2; lower.has(file.toLowerCase()); number++)
    file = `${base}-${number}.json`;
  return file;
}
