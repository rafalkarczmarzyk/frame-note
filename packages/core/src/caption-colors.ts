export type ColorSelectionSource = 'quick' | 'palette' | 'custom';

/** Caption colors are independent of interface accents. Existing token names stay valid. */
export const captionColors = [
  { value: 'caption-white', label: 'White', group: 'Light' },
  { value: 'porcelain', label: 'Porcelain', group: 'Light' },
  { value: 'caption-ivory', label: 'Ivory', group: 'Light' },
  { value: 'caption-silver', label: 'Silver', group: 'Light' },
  { value: 'caption-black', label: 'Black', group: 'Dark' },
  { value: 'caption-charcoal', label: 'Charcoal', group: 'Dark' },
  { value: 'caption-graphite', label: 'Graphite', group: 'Dark' },
  { value: 'caption-warm-gray', label: 'Warm gray', group: 'Dark' },
  { value: 'caption-sand', label: 'Sand', group: 'Warm' },
  { value: 'caption-champagne', label: 'Champagne', group: 'Warm' },
  { value: 'caption-muted-gold', label: 'Muted gold', group: 'Warm' },
  { value: 'caption-blush', label: 'Dusty rose', group: 'Warm' },
  { value: 'caption-sage', label: 'Sage', group: 'Cool' },
  { value: 'caption-mist', label: 'Mist blue', group: 'Cool' },
  { value: 'caption-steel-blue', label: 'Steel blue', group: 'Cool' },
  { value: 'caption-lavender', label: 'Lavender', group: 'Cool' },
] as const;

/** Retained for existing layouts; these are no longer palette options. */
export const legacyCaptionColors = [
  'caption-dark-gray',
  'caption-gray',
  'slate',
  'charcoal',
] as const;

/** Accept RGB or RRGGBB, with an optional hash; never arbitrary CSS. */
export function normalizeHex(value: string): string | null {
  const hex = value.trim().replace(/^#/, '');
  if (!/^(?:[a-f\d]{3}|[a-f\d]{6})$/i.test(hex)) return null;
  return (
    '#' +
    (hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex).toUpperCase()
  );
}

export function captionColorLabel(value: string): string {
  return (
    captionColors.find((color) => color.value === value)?.label ??
    normalizeHex(value) ??
    (
      {
        'caption-dark-gray': 'Dark gray',
        'caption-gray': 'Gray',
        slate: 'Slate',
        charcoal: 'Blue charcoal',
      } as Record<string, string>
    )[value] ??
    value
  );
}

export function resolveCaptionColor(
  value: string,
  token: (name: string) => string,
): string {
  return normalizeHex(value) ?? token(value).trim();
}
