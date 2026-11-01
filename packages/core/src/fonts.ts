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
  'RetiredDisplay',
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
  {
    id: 'RetiredDisplay',
    label: 'RetiredDisplay',
    category: 'Display',
    italic: false,
    bold: true,
    missingPolish: 'ąćęłńśźżĄĆĘŁŃŚŹŻ',
  },
];
export function captionFont(id: string) {
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
    (font) => !captionFonts.some((builtIn) => builtIn.id === font.id),
  );
  notify();
}
export function availableFonts() {
  return [...captionFonts, ...systemFonts];
}
export function fontLabel(id: string) {
  return availableFonts().find((font) => font.id === id)?.label ?? id;
}
export function isFontAvailable(id: string) {
  return (
    !unavailable.has(id) && availableFonts().some((font) => font.id === id)
  );
}
export function markFontUnavailable(id: string) {
  if (!unavailable.has(id)) {
    unavailable.add(id);
    notify();
  }
}
export function resolvedFontFamily(id: string) {
  return isFontAvailable(id) ? id : 'Montserrat Variable';
}
