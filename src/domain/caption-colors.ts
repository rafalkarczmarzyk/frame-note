/** Caption colors are independent of interface accents. Existing token names stay valid. */
export const captionColors = [
  { value: 'porcelain', label: 'Porcelain', group: 'Neutrals' },
  { value: 'caption-silver', label: 'Silver', group: 'Neutrals' },
  { value: 'caption-gray', label: 'Gray', group: 'Neutrals' },
  { value: 'slate', label: 'Slate', group: 'Neutrals' },
  { value: 'charcoal', label: 'Charcoal', group: 'Neutrals' },
  { value: 'caption-black', label: 'Black', group: 'Neutrals' },
  { value: 'caption-ivory', label: 'Ivory', group: 'Soft colors' },
  { value: 'caption-sand', label: 'Sand', group: 'Soft colors' },
  { value: 'caption-blush', label: 'Blush', group: 'Soft colors' },
  { value: 'caption-sage', label: 'Sage', group: 'Soft colors' },
  { value: 'caption-mist', label: 'Mist blue', group: 'Soft colors' },
  { value: 'caption-lavender', label: 'Lavender', group: 'Soft colors' },
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
    value
  );
}

export function resolveCaptionColor(
  value: string,
  token: (name: string) => string,
): string {
  return normalizeHex(value) ?? token(value).trim();
}
