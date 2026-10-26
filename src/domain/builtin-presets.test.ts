import { describe, expect, it } from 'vitest';
import { builtinPresets, defaultTemplate } from './builtin-presets';
import { parsePreset } from './presets';
import { resolveTemplate } from '../features/caption/template';

describe('built-in preset library', () => {
  it('includes eight distinct starting points and the dark Default variant', () => {
    expect(builtinPresets.map((preset) => preset.name)).toEqual([
      'Default',
      'Default dark',
      'Signature',
      'Compact EXIF',
      'Camera & Lens',
      'Focus Stack',
      'EXIF Icons',
      'Astrophotography',
      'Long Exposure',
    ]);
    expect(new Set(builtinPresets.map((preset) => preset.id)).size).toBe(9);
    expect(builtinPresets[0]!.layout.containers[0]!.template).toBe(
      defaultTemplate,
    );
    for (const preset of builtinPresets) {
      expect(
        parsePreset(JSON.stringify(preset), (name, svg) => ({
          name,
          svg,
          aspect: 1,
        })),
      ).toEqual(preset);
      expect(preset.layout.sizingUnit).toBe('short-edge');
      expect(
        preset.layout.containers.some(
          (layer) => layer.id === preset.layout.activeId,
        ),
      ).toBe(true);
      for (const layer of preset.layout.containers)
        expect(resolveTemplate(layer.template, []).invalidSyntax).toBe(false);
    }
  });
  it('packages only the symbols used by EXIF Icons for portable exports', () => {
    const preset = builtinPresets.find(
      (preset) => preset.id === 'builtin-exif-icons',
    )!;
    expect(preset.icons.map((icon) => icon.name).sort()).toEqual([
      'aperture',
      'iso',
      'shutter',
    ]);
    for (const preset of builtinPresets.filter(
      (preset) => preset.id !== 'builtin-exif-icons',
    ))
      expect(preset.icons).toEqual([]);
  });
  it('uses readable durations in both long-exposure presets', () => {
    for (const id of ['builtin-astrophotography', 'builtin-long-exposure']) {
      expect(
        builtinPresets
          .find((preset) => preset.id === id)!
          .layout.containers.some((layer) =>
            layer.template.includes('{shutterDuration}'),
          ),
      ).toBe(true);
    }
  });
});
