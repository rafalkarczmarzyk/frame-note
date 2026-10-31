import { describe, expect, it } from 'vitest';
import { createCaptionLayout } from '../../../core/src/caption-layout';
import {
  captionColors,
  legacyCaptionColors,
} from '../../../core/src/caption-colors';
import { createPreset, parsePreset } from '../../../core/src/presets';

const icon = { name: 'camera', svg: 'artwork', aspect: 1 };
const validate = (name: string, svg: string) => ({ name, svg, aspect: 1 });
function example() {
  const layout = createCaptionLayout();
  layout.containers[0]!.template = '{author} {icon:camera}';
  layout.containers[0]!.position.custom = { x: 23, y: 75 };
  return createPreset('preset-1', 'Wildlife', layout, [
    icon,
    { ...icon, name: 'unused' },
  ]);
}
describe('layout presets', () => {
  it.each(['auto', 'left', 'center', 'right'] as const)(
    'preserves %s alignment',
    (alignment) => {
      const preset = example();
      preset.layout.containers[0]!.style.textAlign = alignment;
      expect(
        parsePreset(JSON.stringify(preset), validate).layout.containers[0]!
          .style.textAlign,
      ).toBe(alignment);
    },
  );
  it.each([
    ...captionColors.map((color) => color.value),
    ...legacyCaptionColors,
    '#AABBCC',
  ])('round trips caption color %s', (color) => {
    const preset = example();
    preset.layout.containers[0]!.style.color = color;
    expect(
      parsePreset(JSON.stringify(preset), validate).layout.containers[0]!.style
        .color,
    ).toBe(color);
  });
  it('round trips layout and only referenced icons without photo data', () => {
    const preset = example();
    expect(preset.icons).toEqual([icon]);
    expect(parsePreset(JSON.stringify(preset), validate)).toEqual(preset);
    expect(preset).not.toHaveProperty('photo');
  });
  it('takes an independent snapshot', () => {
    const layout = createCaptionLayout();
    const preset = createPreset('id', 'Name', layout, []);
    layout.containers[0]!.template = 'changed';
    expect(preset.layout.containers[0]!.template).toBe('');
  });
  it('validates SVG assets including standalone logos', () => {
    const preset = example();
    preset.layout.containers[0]!.images = [
      {
        id: 'art',
        name: 'Signature.svg',
        format: 'svg',
        source: 'artwork',
        width: 1,
        height: 1,
      },
    ];
    let count = 0;
    parsePreset(JSON.stringify(preset), (name, svg) => {
      count++;
      return validate(name, svg);
    });
    expect(count).toBe(2);
    expect(() =>
      parsePreset(JSON.stringify(preset), () => {
        throw Error('Unsafe SVG');
      }),
    ).toThrow('Unsafe SVG');
  });
  it('rejects invalid fields and unsupported versions', () => {
    for (const change of [
      (p: ReturnType<typeof example>) => {
        p.version = 99 as 1;
      },
      (p: ReturnType<typeof example>) => {
        p.layout.containers[0]!.style.color = 'url(unsafe)';
      },
      (p: ReturnType<typeof example>) => {
        p.layout.containers[0]!.position.custom!.x = 101;
      },
      (p: ReturnType<typeof example>) => {
        p.layout.containers.push(p.layout.containers[0]!);
      },
    ]) {
      const preset = example();
      change(preset);
      expect(() => parsePreset(JSON.stringify(preset), validate)).toThrow();
    }
    expect(() => parsePreset('x'.repeat(5_000_001), validate)).toThrow('5 MB');
  });
  it('accepts an empty layout', () => {
    const preset = example();
    preset.layout.containers = [];
    preset.icons = [];
    preset.layout.activeId = null;
    expect(parsePreset(JSON.stringify(preset), validate)).toEqual(preset);
  });
});
