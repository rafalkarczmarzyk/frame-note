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
  'Advercase',
] as const;
export type FontFamily = (typeof fontIds)[number];

export const fontCategories = [
  'Sans-serif',
  'Serif',
  'Monospace',
  'Display',
] as const;
export interface CaptionFont {
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
    id: 'Advercase',
    label: 'Advercase',
    category: 'Display',
    italic: false,
    bold: true,
    missingPolish: 'ąćęłńśźżĄĆĘŁŃŚŹŻ',
  },
];
export function captionFont(id: string) {
  const font = captionFonts.find((font) => font.id === id);
  if (!font) throw new Error(`Unknown caption font: ${id}`);
  return font;
}
