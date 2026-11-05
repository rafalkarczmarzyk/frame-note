import { describe, expect, it } from 'vitest';
import { createCaption } from './document';
import {
  createCaptionLayout,
  containerCaption,
  updateCaption,
  addCaption,
} from './caption-layout';
import { defaultTiledPosition } from './tiled-watermark';
import { convertSizing } from './sizing';

describe('tiled position retention', () => {
  it('keeps manual coordinates and normalized tiled settings across document and unit updates', () => {
    const caption = createCaption();
    caption.position.custom = { x: 25, y: 75 };
    caption.position.tiled = defaultTiledPosition();
    const dimensions = { width: 6000, height: 4000 };
    let layout = createCaptionLayout(caption);
    const converted = convertSizing(
      containerCaption(layout, layout.containers[0]!),
      'px',
      dimensions,
    );
    layout = updateCaption(layout, layout.activeId!, converted, dimensions);
    expect(layout.containers[0]!.position).toEqual({
      anchor: caption.position.anchor,
      custom: { x: 25, y: 75 },
      tiled: defaultTiledPosition(),
    });
    const duplicate = addCaption(layout, 'copy', true, dimensions);
    expect(duplicate.containers[1]!.position).toEqual(
      layout.containers[0]!.position,
    );
    expect(
      addCaption(layout, 'empty', false, dimensions).containers[1]!.position
        .tiled,
    ).toBeUndefined();
  });
});

import { tiledCopies, offsetTiled } from './tiled-watermark';

describe('tiled lattice', () => {
  it.each(['grid', 'staggered'] as const)(
    'centers an origin motif and covers inverse-rotated photo bounds for %s',
    (pattern) => {
      for (const dimensions of [
        { width: 600, height: 4000 },
        { width: 6000, height: 400 },
      ]) {
        for (const angle of [-180, -45, 0, 30.1, 45, 180]) {
          const motif = { width: 120, height: 60 };
          const settings = {
            ...defaultTiledPosition(),
            pattern,
            angle,
            spacing: 0,
            offset: { x: -75, y: -30 },
          };
          const copies = tiledCopies(dimensions, motif, settings);
          const radians = (angle * Math.PI) / 180,
            cos = Math.cos(radians),
            sin = Math.sin(radians);
          // With zero spacing, every photo point must lie in at least one motif.
          for (let x = 0; x <= dimensions.width; x += dimensions.width / 10)
            for (
              let y = 0;
              y <= dimensions.height;
              y += dimensions.height / 10
            ) {
              expect(
                copies.some((copy) => {
                  const dx = x - copy.x,
                    dy = y - copy.y;
                  return (
                    Math.abs(dx * cos + dy * sin) <= motif.width / 2 + 1e-7 &&
                    Math.abs(-dx * sin + dy * cos) <= motif.height / 2 + 1e-7
                  );
                }),
                `${pattern} ${angle} at ${x},${y}`,
              ).toBe(true);
            }
        }
      }
    },
  );
  it('has no copies for empty geometry and rejects dense grids explicitly', () => {
    expect(
      tiledCopies(
        { width: 1000, height: 500 },
        { width: 0, height: 10 },
        defaultTiledPosition(),
      ),
    ).toEqual([]);
    expect(() =>
      tiledCopies(
        { width: 1000, height: 1000 },
        { width: 1, height: 1 },
        { ...defaultTiledPosition(), spacing: 0 },
      ),
    ).toThrow('too dense');
  });
  it('moves in photo axes at 45 degrees and keeps normalized offsets on another photo', () => {
    const tiled = { ...defaultTiledPosition(), angle: 45 };
    const next = offsetTiled(
      tiled,
      { x: 40, y: -20 },
      { width: 600, height: 400 },
    );
    expect(next).toMatchObject({ angle: 45, offset: { x: 10, y: -5 } });
    const center = tiledCopies(
      { width: 1200, height: 800 },
      { width: 100, height: 20 },
      next,
    ).find((p) => p.row === 0 && p.column === 0)!;
    expect(center).toMatchObject({ x: 680, y: 360 });
  });
});
