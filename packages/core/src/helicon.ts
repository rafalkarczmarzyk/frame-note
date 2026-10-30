/** Recognizes the Helicon Focus comment format present in the supplied fixture. */
export function heliconDetails(comment: string) {
  const match = comment
    .trim()
    .match(
      /^Stacked\s+from\s+(\d+)\s+images?\.\s*Method\s*=\s*([ABC])\s*\(\s*R\s*=\s*(\d+)\s*,\s*S\s*=\s*(\d+)\s*\)\s*\.?$/iu,
    );
  if (!match) return null;
  const count = Number(match[1]),
    radius = Number(match[3]),
    smoothing = Number(match[4]);
  if (![count, radius, smoothing].every(Number.isSafeInteger) || count < 1)
    return null;
  return { count, radius, smoothing, method: match[2]!.toUpperCase() };
}

export function parseHeliconComment(comment: string): string | null {
  const details = heliconDetails(comment);
  if (!details) return null;
  const { count, radius, smoothing, method } = details;
  return `Focus stack · ${count} ${count === 1 ? 'image' : 'images'} · Method ${method} · R=${radius} · S=${smoothing}`;
}
