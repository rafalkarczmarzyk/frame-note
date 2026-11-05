import { createPreset, type LayoutPreset } from '../../../../core/src/presets';
import type { CaptionLayout } from '../../../../core/src/caption-layout';
import type { SvgAsset } from '../../../../core/src/svg-asset';

/** Selection and unused artwork do not change the saved composition. */
export function isPresetModified(
  preset: LayoutPreset | undefined,
  layout: CaptionLayout,
  icons: SvgAsset[],
): boolean {
  if (!preset) return false;
  return (
    JSON.stringify(
      createPreset(
        preset.id,
        preset.name,
        { ...layout, activeId: preset.layout.activeId },
        icons,
      ),
    ) !==
    JSON.stringify(
      createPreset(preset.id, preset.name, preset.layout, preset.icons),
    )
  );
}
