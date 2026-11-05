import { describe, expect, it } from 'vitest';
import { builtinPresets } from '@/domain/builtin-presets';
import { isPresetModified } from './preset-modified';

describe('preset modifications', () => {
  const preset = builtinPresets[0]!;
  it('recognizes the saved layout and ignores layer selection', () => {
    expect(isPresetModified(preset, preset.layout, preset.icons)).toBe(false);
    expect(
      isPresetModified(
        preset,
        { ...preset.layout, activeId: null },
        preset.icons,
      ),
    ).toBe(false);
  });
  it('detects edits and clears after restoring or saving the composition', () => {
    const layout = structuredClone(preset.layout);
    layout.containers[0]!.template += ' edited';
    expect(isPresetModified(preset, layout, preset.icons)).toBe(true);
    expect(isPresetModified({ ...preset, layout }, layout, preset.icons)).toBe(
      false,
    );
    expect(
      isPresetModified(preset, structuredClone(preset.layout), preset.icons),
    ).toBe(false);
  });
  it('has no saved state to reset when no preset is selected', () => {
    expect(isPresetModified(undefined, preset.layout, preset.icons)).toBe(
      false,
    );
  });
});
