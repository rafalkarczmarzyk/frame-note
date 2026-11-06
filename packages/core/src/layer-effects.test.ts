import { describe, expect, it } from 'vitest';
import { createCaption } from './document';
import { createCaptionLayout } from './caption-layout';
import { createPreset } from './presets';
import { readPreset } from '../../../scripts/preset-node';
import {
  createLayerEffect,
  effectBleed,
  effectiveLayerEffect,
} from './layer-effects';
import { convertSizing, toPixels } from './sizing';
import { defaultTiledPosition, tiledCopies } from './tiled-watermark';

const dimensions = { width: 6000, height: 4000 };
describe('layer effects', () => {
  it('renders Outline sharply without applying legacy blur or offsets', () => {
    const caption = createCaption();
    const effect = createLayerEffect('outline', caption, dimensions);
    caption.effects = [effect];
    const bleed = effectBleed(caption, dimensions);
    const legacy = { ...effect, x: 20, y: -30, blur: 50 };
    caption.effects = [legacy];
    expect(effectiveLayerEffect(legacy)).toMatchObject({
      x: 0,
      y: 0,
      blur: 0,
      spread: effect.spread,
    });
    expect(effectBleed(caption, dimensions)).toBe(bleed);
    expect(legacy).toMatchObject({ x: 20, y: -30, blur: 50 });
  });
  it('converts all lengths including hidden effects without moving the text', () => {
    const caption = createCaption();
    caption.effects = ['outline', 'shadow', 'glow'].map((type) =>
      createLayerEffect(
        type as 'outline' | 'shadow' | 'glow',
        caption,
        dimensions,
      ),
    );
    caption.effects[1]!.enabled = false;
    caption.effects[1]!.spread = -0.2;
    for (const unit of ['px', 'long-edge', 'short-edge'] as const) {
      const converted = convertSizing(caption, unit, dimensions);
      for (const [index, effect] of converted.effects!.entries())
        for (const key of ['x', 'y', 'spread', 'blur'] as const)
          expect(toPixels(effect[key], unit, dimensions)).toBeCloseTo(
            toPixels(
              caption.effects[index]![key],
              caption.sizingUnit,
              dimensions,
            ),
            8,
          );
      expect(converted.position.anchor).toBe(caption.position.anchor);
      expect(converted.effects![1]!.enabled).toBe(false);
    }
  });
  it('retains ordered effects, disabled settings and unknown fields in v1', () => {
    const caption = createCaption();
    caption.effects = [
      createLayerEffect('outline', caption, dimensions),
      createLayerEffect('shadow', caption, dimensions),
    ];
    caption.effects[1]!.enabled = false;
    const preset = createPreset(
      'effects',
      'Effects',
      createCaptionLayout(caption),
      [],
    );
    const source = JSON.parse(JSON.stringify(preset));
    source.layout.containers[0].effects[0].future = { retained: true };
    const parsed = readPreset(JSON.stringify(source));
    expect(parsed.layout.containers[0]!.effects).toEqual(
      source.layout.containers[0].effects,
    );
    expect(readPreset(JSON.stringify(parsed))).toEqual(parsed);
    delete source.layout.containers[0].effects;
    expect(
      readPreset(JSON.stringify(source)).layout.containers[0]!.effects,
    ).toEqual([]);
  });
  it.each([
    { type: 'invalid' },
    { blur: -1 },
    { opacity: 1.1 },
    { enabled: 'yes' },
    { color: 'bad-color' },
    { spread: -1 },
    { x: Infinity },
  ])('rejects invalid supplied effect data %j', (change) => {
    const caption = createCaption();
    caption.effects = [
      {
        ...createLayerEffect('outline', caption, dimensions),
        ...change,
      } as never,
    ];
    const preset = createPreset(
      'effects',
      'Effects',
      createCaptionLayout(caption),
      [],
    );
    expect(() => readPreset(JSON.stringify(preset))).toThrow();
  });
  it('stores content Blur and counts its extent for logos as well as text', () => {
    const caption = createCaption();
    caption.effects = [createLayerEffect('blur', caption, dimensions)];
    expect(caption.effects[0]!.opacity).toBe(1);
    const parsed = readPreset(
      JSON.stringify(
        createPreset('blur', 'Blur', createCaptionLayout(caption), []),
      ),
    );
    expect(parsed.layout.containers[0]!.effects![0]!.type).toBe('blur');
    caption.logo = {
      asset: { name: 'logo', svg: '<svg/>', aspect: 1 },
      width: 5,
      colorMode: 'original',
    };
    expect(effectBleed(caption, dimensions)).toBeGreaterThan(0);
    caption.effects[0]!.enabled = false;
    expect(effectBleed(caption, dimensions)).toBe(0);
  });
  it('rejects duplicate IDs inside the effect stack', () => {
    const caption = createCaption();
    const effect = createLayerEffect('shadow', caption, dimensions);
    caption.effects = [effect, { ...effect }];
    expect(() =>
      readPreset(
        JSON.stringify(
          createPreset('effects', 'Effects', createCaptionLayout(caption), []),
        ),
      ),
    ).toThrow('identifiers');
  });
  it('expands visible Tiled copies without changing lattice positions or spacing', () => {
    const tiled = { ...defaultTiledPosition(), angle: 37, spacing: 5 };
    const motif = { width: 300, height: 90 };
    const normal = tiledCopies(dimensions, motif, tiled);
    const expanded = tiledCopies(dimensions, motif, tiled, 200);
    expect(expanded.length).toBeGreaterThan(normal.length);
    for (const item of normal) expect(expanded).toContainEqual(item);
    const caption = createCaption();
    caption.effects = [createLayerEffect('shadow', caption, dimensions)];
    expect(effectBleed(caption, dimensions)).toBeGreaterThan(0);
    caption.effects[0]!.enabled = false;
    expect(effectBleed(caption, dimensions)).toBe(0);
  });
});
