import { describe, it, expect } from 'vitest';
import { backgroundRect, createLayerBackground } from './layer-background';
import { createCaption } from './document';
import { convertSizing } from './sizing';
import { addCaption, createCaptionLayout } from './caption-layout';
import { createPreset, parsePreset } from './presets';

const dimensions = { width: 1200, height: 800 };
describe('layer backgrounds', () => {
  it('expands around stable content and ignores None and empty content', () => {
    const b = createLayerBackground();
    const rect = { x: 30, y: 40, width: 200, height: 50 };
    expect(backgroundRect(rect, b)).toEqual(rect);
    b.type = 'color';
    b.padding = { top: 5, right: 7, bottom: 9, left: 12 };
    expect(backgroundRect(rect, b)).toEqual({
      x: 18,
      y: 35,
      width: 219,
      height: 64,
    });
    expect(rect.x).toBe(30);
    expect(backgroundRect({ ...rect, width: 0 }, b).width).toBe(0);
  });
  it('converts all retained dimensions, including negative shadow offsets', () => {
    const c = createCaption();
    c.background = createLayerBackground();
    c.background.shadow.x = -2;
    const px = convertSizing(c, 'px', dimensions);
    expect(px.background?.padding.left).toBe(16);
    expect(px.background?.shadow.x).toBe(-16);
    expect(convertSizing(px, c.sizingUnit, dimensions).background).toEqual(
      c.background,
    );
  });
  it('duplicates backgrounds independently and roundtrips presets', () => {
    const c = createCaption();
    c.background = createLayerBackground();
    c.background.type = 'glass';
    const layout = addCaption(createCaptionLayout(c), 'copy', true, dimensions);
    layout.containers[1]!.background!.padding.top = 7;
    expect(layout.containers[0]!.background!.padding.top).toBe(1.5);
    const preset = createPreset('id', 'Background', layout, []);
    expect(
      parsePreset(JSON.stringify(preset), () => {
        throw Error('no svg');
      }).layout,
    ).toEqual(preset.layout);
  });
  it('rejects invalid background dimensions and colors in presets', () => {
    const c = createCaption();
    c.background = createLayerBackground();
    const p = createPreset('id', 'Background', createCaptionLayout(c), []);
    for (const change of [
      () => {
        p.layout.containers[0]!.background!.blur = -1;
      },
      () => {
        p.layout.containers[0]!.background!.color = 'url(unsafe)';
      },
      () => {
        p.layout.containers[0]!.background!.shadow.opacity = 2;
      },
    ]) {
      change();
      expect(() =>
        parsePreset(JSON.stringify(p), () => {
          throw Error('no svg');
        }),
      ).toThrow();
    }
  });
});
