import { z } from 'zod';

// One current preset schema. Optional additions are normalized after validation.
const nonnegative = z.number().min(0).max(1e7);
const fraction = z.number().min(0).max(1);
const signed = z.number().min(-1e7).max(1e7);
const color = z.string().max(64);
const asset = z.looseObject({
  name: z.string().max(255),
  svg: z.string().max(256_000),
  aspect: z.number().positive().max(100),
});
const image = z.looseObject({
  id: z.string().regex(/^[a-zA-Z0-9-]{1,100}$/u),
  name: z.string().max(255),
  format: z.enum(['svg', 'png']),
  source: z.string().max(2_666_700),
  width: z.number().positive().max(16384),
  height: z.number().positive().max(16384),
});
const style = z.looseObject({
  // Preserve unknown font names and resolve availability at runtime.
  fontFamily: z
    .string()
    .min(1)
    .max(1024)
    .refine((value) => value.trim().length > 0),
  fontWeight: z.union([z.literal(400), z.literal(700)]),
  fontStyle: z.enum(['normal', 'italic']).optional(),
  fontSize: nonnegative,
  color,
  opacity: fraction,
  lineHeight: z.number().min(0.1).max(10),
  textAlign: z.enum(['auto', 'left', 'center', 'right']),
});
const tiledPosition = z.looseObject({
  enabled: z.boolean(),
  pattern: z.enum(['grid', 'staggered']),
  angle: z.number().min(-180).max(180),
  spacing: z.number().min(0).max(100),
  offset: z.looseObject({
    x: z.number().min(-100).max(100),
    y: z.number().min(-100).max(100),
  }),
});
const blending = z.looseObject({
  mode: z.enum(['normal', 'multiply', 'screen', 'soft-light', 'add']),
  opacity: fraction,
});
const position = z.looseObject({
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
  tiled: tiledPosition.optional(),
  custom: z
    .looseObject({
      x: z.number().min(0).max(100),
      y: z.number().min(0).max(100),
    })
    .optional(),
});
const margins = z.looseObject({
  top: nonnegative,
  right: nonnegative,
  bottom: nonnegative,
  left: nonnegative,
});
const link = z.enum(['none', 'pairs', 'all']);
const background = z.looseObject({
  type: z.enum(['none', 'color', 'glass']),
  color,
  opacity: fraction,
  padding: margins,
  paddingLinkMode: link,
  radius: nonnegative,
  blur: nonnegative,
  shadow: z.looseObject({
    enabled: z.boolean(),
    color,
    opacity: fraction,
    blur: nonnegative,
    spread: signed,
    x: signed,
    y: signed,
  }),
});
const container = z.looseObject({
  blending: blending.optional(),
  id: z.string().min(1).max(100),
  template: z.string().max(100_000),
  style,
  position,
  visible: z.boolean().optional(),
  background: background.optional(),
  images: z.array(image).max(100).optional(),
});
const header = {
  id: z.string().min(1).max(100),
  name: z.string().max(80).trim().min(1),
  icons: z.array(asset).max(100),
};
const layoutFields = {
  sizingUnit: z.enum(['px', 'short-edge', 'long-edge']),
  margins,
  marginLinkMode: link,
  activeId: z.string().max(100).nullable(),
};

/** 2 and 3 are historical development labels, validated by the same schema.
 * New output always uses 1; missing optional capabilities get safe defaults. */
export const presetSchema = z.looseObject({
  ...header,
  version: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  layout: z.looseObject({
    ...layoutFields,
    containers: z.array(container).max(100),
  }),
});
