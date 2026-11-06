import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createCaptionLayout } from './caption-layout';
import { createPreset } from './presets';
import { readPreset } from '../../../scripts/preset-node';

describe('preset read/write', () => {
  it('normalizes an older preset with missing optional capabilities', () => {
    const source = readFileSync('tests/fixtures/presets/minimal.json', 'utf8');
    const value = readPreset(source);
    expect(value.version).toBe(1);
    expect(value.layout.containers[0]!.template).toBe(
      '{author}\n{image:signature:2:font:original}',
    );
    expect(value.layout.containers[0]!.images![0]!.width).toBe(2);
    expect(readPreset(JSON.stringify(value))).toEqual(value);
  });
  const preset = () =>
    createPreset('preset-1', 'Test', createCaptionLayout(), []);
  it('writes complete presets as v1', () => {
    const value = preset();
    expect(value.version).toBe(1);
    const parsed = readPreset(JSON.stringify(value));
    expect(parsed).toEqual(value);
    expect(
      createPreset(parsed.id, parsed.name, parsed.layout, parsed.icons),
    ).toEqual(parsed);
  });
  it('rejects unsupported versions and missing format markers', () => {
    expect(() =>
      readPreset(JSON.stringify({ ...preset(), version: 4 })),
    ).toThrow('newer');
    expect(() =>
      readPreset(JSON.stringify({ ...preset(), version: 0 })),
    ).toThrow('Invalid');
    expect(() =>
      readPreset(JSON.stringify({ ...preset(), version: undefined })),
    ).toThrow('Invalid');
  });
  it('rejects malformed and unsafe embedded assets', () => {
    const value = preset();
    value.layout.containers[0]!.images = [
      {
        id: 'svg',
        name: 'Art',
        format: 'svg',
        source: '<svg viewBox="0 0 1 1"><script/></svg>',
        width: 1,
        height: 1,
      },
    ];
    expect(() => readPreset(JSON.stringify(value))).toThrow('Unsupported SVG');
    value.layout.containers[0]!.images![0]!.source =
      '<svg viewBox="0 0 2 1"><path d="M0 0h2v1H0z"/></svg>';
    const parsed = readPreset(JSON.stringify(value));
    expect(parsed.layout.containers[0]!.images![0]!.width).toBe(2);
    expect(readPreset(JSON.stringify(parsed))).toEqual(parsed);
  });
  it('rejects duplicate IDs and invalid PNG content', () => {
    const value = preset();
    value.layout.containers.push(value.layout.containers[0]!);
    expect(() => readPreset(JSON.stringify(value))).toThrow();
    value.layout.containers.pop();
    value.layout.containers[0]!.images = [
      {
        id: 'png',
        name: 'Art',
        format: 'png',
        source: 'data:image/png;base64,AAAA',
        width: 1,
        height: 1,
      },
    ];
    expect(() => readPreset(JSON.stringify(value))).toThrow('PNG');
  });
  it.each([1, 2, 3])(
    'reads label %i with one schema and writes v1',
    (version) => {
      const input = JSON.parse(
        readFileSync('tests/fixtures/presets/complete.json', 'utf8'),
      );
      input.version = version;
      const value = readPreset(JSON.stringify(input));
      expect(value.version).toBe(1);
      expect(value.layout.containers[0]!.position.tiled).toEqual(
        input.layout.containers[0].position.tiled,
      );
      expect(value.layout.containers[0]!.blending).toEqual({
        mode: 'soft-light',
        opacity: 0.5,
      });
      expect(
        readPreset(
          JSON.stringify(
            createPreset(value.id, value.name, value.layout, value.icons),
          ),
        ),
      ).toEqual(value);
    },
  );
  it('defaults missing capabilities without changing existing style or position', () => {
    const input = JSON.parse(
      readFileSync('tests/fixtures/presets/minimal.json', 'utf8'),
    );
    input.layout.containers[0].style.opacity = 0.31;
    input.layout.containers[0].position.custom = { x: 23, y: 76 };
    const value = readPreset(JSON.stringify(input));
    const layer = value.layout.containers[0]!;
    expect(layer.blending).toEqual({ mode: 'normal', opacity: 1 });
    expect(layer.position.tiled?.enabled).toBe(false);
    expect(layer.style).toEqual(input.layout.containers[0].style);
    expect(layer.position.custom).toEqual({ x: 23, y: 76 });
    expect(input.layout.containers[0]).not.toHaveProperty('blending');
    expect(input.layout.containers[0].position).not.toHaveProperty('tiled');
  });
  it('preserves every blending mode at 0/50/100% and retained Tiled settings', () => {
    const input = readPreset(
      readFileSync('tests/fixtures/presets/complete.json', 'utf8'),
    );
    for (const mode of [
      'normal',
      'multiply',
      'screen',
      'soft-light',
      'add',
    ] as const) {
      for (const opacity of [0, 0.5, 1]) {
        input.layout.containers[0]!.blending = { mode, opacity };
        input.layout.containers[0]!.position.tiled!.enabled = false;
        expect(readPreset(JSON.stringify(input))).toEqual(input);
      }
    }
  });
  it('rejects invalid additions instead of replacing them with defaults', () => {
    for (const patch of [
      { blending: { mode: 'subtract', opacity: 1 } },
      { blending: { mode: 'normal', opacity: -1 } },
      { blending: { mode: 'screen', opacity: 1.01 } },
      { blending: { mode: 'add' } },
      { blending: null },
      { position: { anchor: 'center', tiled: { enabled: true } } },
      { position: { anchor: 'center', tiled: null } },
    ]) {
      const input = JSON.parse(
        readFileSync('tests/fixtures/presets/minimal.json', 'utf8'),
      );
      Object.assign(input.layout.containers[0], patch);
      expect(() => readPreset(JSON.stringify(input))).toThrow('Invalid');
    }
  });
  it('accepts and retains unknown fields throughout read/save/read', () => {
    const input = JSON.parse(
      readFileSync('tests/fixtures/presets/complete.json', 'utf8'),
    );
    input.future = { nested: [1, 'future'] };
    input.layout.future = { enabled: true };
    input.layout.margins.future = 2;
    const layer = input.layout.containers[0];
    layer.future = { effect: true };
    layer.style.future = 'typography';
    layer.position.future = 'position';
    layer.position.tiled.future = { more: true };
    layer.position.tiled.offset.future = 12;
    layer.blending.future = { strength: 0.8 };
    layer.images[0].future = { crop: 'keep' };
    layer.background = {
      type: 'color',
      color: 'charcoal',
      opacity: 0.4,
      padding: { top: 1, right: 1, bottom: 1, left: 1, future: 3 },
      paddingLinkMode: 'all',
      radius: 0,
      blur: 0,
      shadow: {
        enabled: false,
        color: 'caption-black',
        opacity: 0.5,
        blur: 1,
        spread: 0,
        x: 0,
        y: 0,
        future: true,
      },
      future: 'background',
    };
    input.icons.push({
      name: 'future-icon',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><path d="M0 0h1v1H0z"/></svg>',
      aspect: 1,
      future: 'icon',
    });
    layer.template += ' {icon:future-icon}';
    const parsed = readPreset(JSON.stringify(input));
    expect(parsed).toMatchObject({
      future: input.future,
      layout: {
        future: input.layout.future,
        margins: { future: 2 },
        containers: [
          {
            future: layer.future,
            style: { future: 'typography' },
            position: {
              future: 'position',
              tiled: { future: { more: true }, offset: { future: 12 } },
            },
            blending: { future: { strength: 0.8 } },
            images: [{ future: { crop: 'keep' } }],
            background: {
              future: 'background',
              padding: { future: 3 },
              shadow: { future: true },
            },
          },
        ],
      },
      icons: [{ future: 'icon' }],
    });
    const saved = createPreset(
      parsed.id,
      parsed.name,
      parsed.layout,
      parsed.icons,
      parsed,
    );
    expect(readPreset(JSON.stringify(saved))).toEqual(parsed);
  });
});

describe('letter spacing compatibility', () => {
  it('round-trips em tracking and rejects invalid supplied tracking', () => {
    const preset = createPreset(
      'tracking',
      'Tracking',
      createCaptionLayout(),
      [],
    );
    for (const letterSpacing of [-0.1, 0, 0.05, 1]) {
      preset.layout.containers[0]!.style.letterSpacing = letterSpacing;
      expect(
        readPreset(JSON.stringify(preset)).layout.containers[0]!.style
          .letterSpacing,
      ).toBe(letterSpacing);
    }
    for (const letterSpacing of [-0.11, 1.01, '0.1', null]) {
      const wire = JSON.parse(JSON.stringify(preset));
      wire.layout.containers[0].style.letterSpacing = letterSpacing;
      expect(() => readPreset(JSON.stringify(wire))).toThrow('letterSpacing');
    }
    delete preset.layout.containers[0]!.style.letterSpacing;
    expect(
      readPreset(JSON.stringify(preset)).layout.containers[0]!.style
        .letterSpacing ?? 0,
    ).toBe(0);
  });
});
