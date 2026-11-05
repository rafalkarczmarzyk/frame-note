import { z } from 'zod';

/** Additive settings stay in v1; retain unknown fields without interpreting them. */
export const desktopConfigSchema = z.looseObject({
  version: z.literal(1),
  exportQuality: z.number().int().min(1).max(100).default(95),
  removeMetadata: z.boolean().default(true),
  historyLimit: z.number().int().min(1).max(1000).default(100),
  rememberWindow: z.boolean().default(false),
  checkUpdatesAtStartup: z.boolean().default(true),
  window: z
    .looseObject({
      x: z.number().int(),
      y: z.number().int(),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      displayId: z.number().int(),
      maximized: z.boolean(),
    })
    .optional(),
});
export type DesktopConfig = Pick<
  z.infer<typeof desktopConfigSchema>,
  keyof typeof desktopConfigSchema.shape
>;
export type SettingsValues = Pick<
  DesktopConfig,
  'historyLimit' | 'rememberWindow' | 'checkUpdatesAtStartup'
>;
export const defaultDesktopConfig = (): DesktopConfig =>
  desktopConfigSchema.parse({ version: 1 });
export function parseDesktopConfig(value: unknown): DesktopConfig {
  return desktopConfigSchema.parse(value);
}
