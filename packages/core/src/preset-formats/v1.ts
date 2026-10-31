import { z } from 'zod';
import { header, layoutFields, container } from './fields';
/** First official preset contract. Changes require a new versioned schema. */
export const presetV1 = z.strictObject({
  ...header,
  version: z.literal(1),
  layout: z.strictObject({
    ...layoutFields,
    containers: z.array(container).max(100),
  }),
});
export type PresetV1 = z.infer<typeof presetV1>;
