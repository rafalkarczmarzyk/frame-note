import { describe, expect, it } from 'vitest';
import { builtinPresets, defaultTemplate } from './builtin-presets';
import { parsePreset } from '../../../core/src/presets';
import { createMetadataField } from '../../../core/src/metadata';
import { resolveCaptionContent } from '../features/caption/inline-content';
import { builtinIcons } from '../features/caption/builtin-icons';
import { resolveTemplate } from '../features/caption/template';

describe('built-in preset library', () => {
  it('provides valid, uniquely identified starting presets', () => {
    expect(builtinPresets.length).toBeGreaterThan(0);
    expect(new Set(builtinPresets.map((preset) => preset.id)).size).toBe(
      builtinPresets.length,
    );
    expect(
      builtinPresets.some((preset) => preset.name === 'Photo Details'),
    ).toBe(true);
    expect(
      builtinPresets.find((preset) => preset.name === 'Photo Details')!.layout
        .containers[0]!.template,
    ).toBe(defaultTemplate);
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
  it('packages only used symbols and keeps the seven distinct layouts portable', () => {
    expect(builtinPresets.map((p) => p.name)).toEqual([
      'Photo Details',
      'Signature',
      'Focus Stack',
      'Glass Caption',
      'Proof Watermark',
      'Quartz Date',
      'Digital Date',
    ]);
    expect(builtinPresets[0]!.icons.map((i) => i.name).sort()).toEqual([
      'aperture',
      'iso',
      'shutter',
    ]);
    expect(builtinPresets[2]!.icons.map((i) => i.name).sort()).toEqual([
      'aperture',
      'iso',
      'shutter',
      'stack',
    ]);
    for (const preset of builtinPresets.filter(
      (p) => !['builtin-default', 'builtin-macro'].includes(p.id),
    ))
      expect(preset.icons).toEqual([]);
  });
});

const field = (name: string, displayValue: string, group = 'exif') =>
  createMetadataField({ group, name, displayValue, rawValue: displayValue });
it('formats Quartz Date from validated source dates without timezone conversion', () => {
  for (const [source, expected] of [
    ['2026:11:06 23:30:00-10:00', '2026-11-06'],
    ['2000-02-29', '2000-02-29'],
    ['2025-02-29', ''],
    ['', ''],
  ]) {
    expect(
      resolveTemplate('{date}', [field('DateTimeOriginal', source!)]).text,
    ).toBe(expected);
  }
  expect(
    resolveTemplate('{date}', [
      field('DateTimeOriginal', 'invalid'),
      field('DateCreated', '20261106', 'iptc'),
    ]).text,
  ).toBe('2026-11-06');
  const xmp = field('DateTimeOriginal', '2026-11-06', 'xmp');
  xmp.candidates = [
    {
      group: 'xmp',
      name: 'DateTimeOriginal',
      source: 'xmp:exif:DateTimeOriginal',
      rawValue: xmp.rawValue,
      displayValue: xmp.displayValue,
      namespaceUri: 'http://ns.adobe.com/exif/1.0/',
    },
  ];
  expect(resolveTemplate('{date}', [xmp]).text).toBe('2026-11-06');
  expect(resolveTemplate('{date}', [xmp]).text).toBe('2026-11-06');
});
it('hides orphan stack icons and labels, preserving the missing-data warning', () => {
  const template = builtinPresets[2]!.layout.containers[1]!.template;
  const empty = resolveCaptionContent(template, [], builtinIcons);
  expect(empty.text).toBe('');
  expect(empty.missing).toContain('heliconStackSummary');
  for (const count of [1, 15]) {
    const result = resolveCaptionContent(
      template,
      [
        field(
          'UserComment',
          `Stacked from ${count} images. Method=A (R=8,S=4)`,
        ),
      ],
      builtinIcons,
    );
    expect(result.text).toContain(
      `Stacked ${count} ${count === 1 ? 'frame' : 'frames'}`,
    );
    expect(result.missing).toEqual([]);
  }
  expect(
    resolveCaptionContent('Personal label {author}', [], builtinIcons).text,
  ).toBe('Personal label ');
});

it('preserves standalone image content when adjacent metadata is missing', () => {
  expect(
    resolveTemplate('\uE0000\uE001 {author}', [], '{image:logo} {author}').text,
  ).toBe('\uE0000\uE001 ');
});
