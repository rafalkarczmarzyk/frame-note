import { z } from 'zod';

// Frozen wire primitives for official v1. Do not derive these from live UI catalogs.
const nonnegative = z.number().min(0).max(1e7);
const fraction = z.number().min(0).max(1);
const signed = z.number().min(-1e7).max(1e7);
const color = z.string().max(64);
export const asset = z.strictObject({
  name: z.string().max(255),
  svg: z.string().max(256_000),
  aspect: z.number().positive().max(100),
});
export const image = z.strictObject({
  id: z.string().regex(/^[a-zA-Z0-9-]{1,100}$/u),
  name: z.string().max(255),
  format: z.enum(['svg', 'png']),
  source: z.string().max(2_666_700),
  width: z.number().positive().max(16384),
  height: z.number().positive().max(16384),
});
export const style = z.strictObject({
  fontFamily: z.enum([
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
  ]),
  fontWeight: z.union([z.literal(400), z.literal(700)]),
  fontStyle: z.enum(['normal', 'italic']).optional(),
  fontSize: nonnegative,
  color,
  opacity: fraction,
  lineHeight: z.number().min(0.1).max(10),
  textAlign: z.enum(['auto', 'left', 'center', 'right']),
});
export const position = z.strictObject({
  anchor: z.enum([
    'top-left',
    'top-center',
    'top-right',
    'center-left',
    'center',
    'center-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ]),
  custom: z
    .strictObject({
      x: z.number().min(0).max(100),
      y: z.number().min(0).max(100),
    })
    .optional(),
});
export const margins = z.strictObject({
  top: nonnegative,
  right: nonnegative,
  bottom: nonnegative,
  left: nonnegative,
});
export const link = z.enum(['none', 'pairs', 'all']);
export const background = z.strictObject({
  type: z.enum(['none', 'color', 'glass']),
  color,
  opacity: fraction,
  padding: margins,
  paddingLinkMode: link,
  radius: nonnegative,
  blur: nonnegative,
  shadow: z.strictObject({
    enabled: z.boolean(),
    color,
    opacity: fraction,
    blur: nonnegative,
    spread: signed,
    x: signed,
    y: signed,
  }),
});
export const container = z.strictObject({
  id: z.string().min(1).max(100),
  template: z.string().max(100_000),
  style,
  position,
  visible: z.boolean().optional(),
  background: background.optional(),
  images: z.array(image).max(100).optional(),
});
export const header = {
  id: z.string().min(1).max(100),
  name: z.string().max(80).trim().min(1),
  icons: z.array(asset).max(100),
};
export const layoutFields = {
  sizingUnit: z.enum(['px', 'short-edge', 'long-edge']),
  margins,
  marginLinkMode: link,
  activeId: z.string().max(100).nullable(),
};
