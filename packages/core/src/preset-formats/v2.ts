import { z } from 'zod';
import { header, layoutFields, container, position } from './fields';
import type { PresetV1 } from './v1';

/** Frozen v2 extension: v1 primitives remain unchanged. */
export const tiledPositionV2 = z.strictObject({
  enabled: z.boolean(),
  pattern: z.enum(['grid', 'staggered']),
  angle: z.number().min(-180).max(180),
  spacing: z.number().min(0).max(100),
  offset: z.strictObject({
    x: z.number().min(-100).max(100),
    y: z.number().min(-100).max(100),
  }),
});
export const presetV2 = z.strictObject({
  ...header,
  version: z.literal(2),
  layout: z.strictObject({
    ...layoutFields,
    containers: z
      .array(
        container.extend({
          position: position.extend({ tiled: tiledPositionV2.optional() }),
        }),
      )
      .max(100),
  }),
});
export type PresetV2 = z.infer<typeof presetV2>;
export function migratePresetV1(value: PresetV1): PresetV2 {
  return { ...structuredClone(value), version: 2 };
}
