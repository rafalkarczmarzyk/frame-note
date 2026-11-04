import { z } from 'zod';

/** Frozen configuration format v1. Additions require a new format version. */
export const desktopConfigV1 = z.strictObject({
  version: z.literal(1),
  exportQuality: z.number().int().min(1).max(100).default(95),
  removeMetadata: z.boolean().default(true),
  historyLimit: z.number().int().min(1).max(1000).default(100),
  rememberWindow: z.boolean().default(false),
  checkUpdatesAtStartup: z.boolean().default(true),
  window: z
    .strictObject({
      x: z.number().int(),
      y: z.number().int(),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      displayId: z.number().int(),
      maximized: z.boolean(),
    })
    .optional(),
});
export type DesktopConfig = z.infer<typeof desktopConfigV1>;
export type SettingsValues = Pick<
  DesktopConfig,
  'historyLimit' | 'rememberWindow' | 'checkUpdatesAtStartup'
>;
export const defaultDesktopConfig = (): DesktopConfig =>
  desktopConfigV1.parse({ version: 1 });
export function parseDesktopConfig(value: unknown): DesktopConfig {
  return desktopConfigV1.parse(value);
}
