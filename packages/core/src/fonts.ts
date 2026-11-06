import { segmentYearMark } from './date-format';
import googleFonts from './google-fonts.json';

/** Stable identifiers are independent of font delivery and preserve legacy presets. */
export const fontIds = [
  'Montserrat Variable',
  'Inter',
  'DM Sans',
  'Manrope',
  'Poppins',
  'Raleway',
  'Outfit',
  'Work Sans',
  'Playfair Display',
  'Cormorant Garamond',
  'DM Serif Display',
  'Libre Baskerville',
  'Lora',
  'Bodoni Moda',
  'Fraunces',
  'Prata',
  'JetBrains Mono',
  'IBM Plex Mono',
  'Space Mono',
  'Roboto Mono',
  'DM Mono',
  'Bebas Neue',
  'Oswald',
  'Archivo Black',
  'Cinzel',
  '7-Segment',
] as const;
export type FontFamily = string;

export const fontCategories = [
  'Sans-serif',
  'Serif',
  'Monospace',
  'Display',
] as const;
export interface CaptionFont {
  faces?: readonly { weight: 400 | 700; style: 'normal' | 'italic' }[];
  id: FontFamily;
  label: string;
  category: string;
  italic: boolean;
  bold: boolean;
  missingPolish: string;
}
export const captionFonts: readonly CaptionFont[] = [
  {
    id: 'Montserrat Variable',
    label: 'Montserrat',
    category: 'Sans-serif',
    italic: true,
    bold: true,
    missingPolish: '',
  },
  {
    id: '7-Segment',
    label: '7-Segment',
    category: 'Display',
    italic: false,
    bold: false,
    missingPolish: 'ąćęłńóśźżĄĆĘŁŃÓŚŹŻ',
  },
  ...googleFonts.map((font) => ({
    id: fontIds.find((id) => id === font.id)!,
    label: font.label,
    category: font.category,
    italic: font.faces.some((face) => face.style === 'italic'),
    bold: font.faces.some((face) => {
      const range = face.weight.split(' ').map(Number);
      return range.length === 2
        ? range[0]! <= 700 && range[1]! >= 700
        : range[0] === 700;
    }),
    missingPolish:
      font.faces.map((face) => face.missingPolish).find(Boolean) ?? '',
  })),
];
/** Retain legacy preset names while resolving the retired bundled font to its replacement. */
function currentFontId(id: string) {
  return id === 'DSEG7 Classic' ? '7-Segment' : id;
}
export function captionFont(id: string) {
  id = currentFontId(id);
  return (
    (unavailable.has(id)
      ? undefined
      : availableFonts().find((font) => font.id === id)) ?? captionFonts[0]!
  );
}

let systemFonts: readonly CaptionFont[] = [];
const unavailable = new Set<string>();
const listeners = new Set<() => void>();
let revision = 0;
export function subscribeFonts(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export const fontRevision = () => revision;
function notify() {
  revision++;
  listeners.forEach((listener) => listener());
}
export function setSystemFonts(fonts: readonly CaptionFont[]) {
  systemFonts = fonts.filter(
    (font) =>
      !captionFonts.some((builtIn) => builtIn.id === currentFontId(font.id)),
  );
  notify();
}
export function availableFonts() {
  return [...captionFonts, ...systemFonts];
}
export function fontLabel(id: string) {
  id = currentFontId(id);
  return availableFonts().find((font) => font.id === id)?.label ?? id;
}
export function isFontAvailable(id: string) {
  id = currentFontId(id);
  return (
    !unavailable.has(id) && availableFonts().some((font) => font.id === id)
  );
}
export function markFontUnavailable(id: string) {
  id = currentFontId(id);
  if (!unavailable.has(id)) {
    unavailable.add(id);
    notify();
  }
}
export function resolvedFontFamily(id: string) {
  id = currentFontId(id);
  return isFontAvailable(id) ? id : 'Montserrat Variable';
}

/** Explicit local fallback for symbols and letters absent from segment displays. */
export function captionRenderFont(id: string) {
  const family = resolvedFontFamily(id);
  return family === '7-Segment' ? '"7-Segment", "Montserrat Variable"' : family;
}

/** Keep the font-specific year mark readable when changing to another family. */
export function captionRenderText(id: string, text: string) {
  return resolvedFontFamily(id) === '7-Segment'
    ? text.replace(/['’](?=\d{2}(?!\d))/gu, segmentYearMark)
    : text.replaceAll(segmentYearMark, "'");
}
