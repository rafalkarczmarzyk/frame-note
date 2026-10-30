import { describe, expect, it } from 'vitest';
import { createCaption } from '../../../core/src/document';
import {
  changeMargin,
  setMarginLinkMode,
  convertSizing,
  marginLimits,
  pixelsPerUnit,
  toPixels,
  type SizingUnit,
} from '../../../core/src/sizing';

const units: SizingUnit[] = ['px', 'short-edge', 'long-edge'];
describe.each([
  { width: 6000, height: 4000 },
  { width: 4000, height: 6000 },
])('sizing on $width × $height', (dimensions) => {
  it('uses source image edges, independently of orientation', () => {
    expect(toPixels(3, 'short-edge', dimensions)).toBe(120);
    expect(toPixels(3, 'long-edge', dimensions)).toBe(180);
    expect(toPixels(3, 'px', dimensions)).toBe(3);
  });
  it.each(units)(
    'preserves font size and asymmetric margins when converting to %s and back',
    (unit) => {
      const original = createCaption();
      original.position.margins = {
        top: 1.25,
        right: 2.5,
        bottom: 3.75,
        left: 4.125,
      };
      const converted = convertSizing(original, unit, dimensions);
      expect(toPixels(converted.style.fontSize, unit, dimensions)).toBeCloseTo(
        toPixels(original.style.fontSize, original.sizingUnit, dimensions),
        10,
      );
      for (const side of ['top', 'right', 'bottom', 'left'] as const) {
        expect(
          toPixels(converted.position.margins[side], unit, dimensions),
        ).toBeCloseTo(
          toPixels(
            original.position.margins[side],
            original.sizingUnit,
            dimensions,
          ),
          10,
        );
      }
      const restored = convertSizing(
        converted,
        original.sizingUnit,
        dimensions,
      );
      expect(restored.style.fontSize).toBeCloseTo(original.style.fontSize, 10);
      expect(original.sizingUnit).toBe('short-edge');
      expect(converted.style.lineHeight).toBe(original.style.lineHeight);
      expect(converted.style.opacity).toBe(original.style.opacity);
    },
  );
  it.each(units)(
    'keeps a pixel inside linked and independent margin limits in %s',
    (unit) => {
      const margins = { top: 2, right: 3, bottom: 4, left: 5 };
      const limits = marginLimits(margins, unit, dimensions, 'none');
      expect(
        toPixels(limits.left + margins.right, unit, dimensions),
      ).toBeCloseTo(dimensions.width - 1);
      expect(
        toPixels(limits.top + margins.bottom, unit, dimensions),
      ).toBeCloseTo(dimensions.height - 1);
      const linked = marginLimits(margins, unit, dimensions, 'all').top;
      expect(linked * 2 * pixelsPerUnit(unit, dimensions)).toBeCloseTo(
        Math.min(dimensions.width, dimensions.height) - 1,
      );
    },
  );
});
it('updates one edge independently or all linked edges', () => {
  const margins = { top: 1, right: 2, bottom: 3, left: 4 };
  expect(changeMargin(margins, 'left', 8, 'none')).toEqual({
    top: 1,
    right: 2,
    bottom: 3,
    left: 8,
  });
  expect(changeMargin(margins, 'left', 8, 'all')).toEqual({
    top: 8,
    right: 8,
    bottom: 8,
    left: 8,
  });
  expect(margins.left).toBe(4);
});
it('relative sizes scale with the image while pixels stay fixed', () => {
  expect(toPixels(3, 'short-edge', { width: 3000, height: 2000 })).toBe(60);
  expect(toPixels(120, 'px', { width: 3000, height: 2000 })).toBe(120);
});

it.each(['top', 'right', 'bottom', 'left'] as const)(
  'updates the opposite edge of %s in pairs mode',
  (side) => {
    const initial = { top: 1, bottom: 1, left: 2, right: 2 };
    const result = changeMargin(initial, side, 8, 'pairs');
    expect(result[side]).toBe(8);
    if (side === 'top' || side === 'bottom')
      expect(result).toEqual({ top: 8, bottom: 8, left: 2, right: 2 });
    else expect(result).toEqual({ top: 1, bottom: 1, left: 8, right: 8 });
  },
);
it.each([
  { width: 6000, height: 4000 },
  { width: 4000, height: 6000 },
])('uses separate axis limits for pairs on $width × $height', (dimensions) => {
  const limits = marginLimits(
    { top: 0, bottom: 0, left: 0, right: 0 },
    'px',
    dimensions,
    'pairs',
  );
  expect(limits.top * 2).toBe(dimensions.height - 1);
  expect(limits.left * 2).toBe(dimensions.width - 1);
});

it('normalizes modes from top and left without mutating or losing unlinked values', () => {
  const values = { top: 1, bottom: 2, left: 3, right: 4 };
  const dimensions = { width: 6000, height: 4000 };
  expect(setMarginLinkMode(values, 'pairs', 'short-edge', dimensions)).toEqual({
    top: 1,
    bottom: 1,
    left: 3,
    right: 3,
  });
  expect(setMarginLinkMode(values, 'all', 'short-edge', dimensions)).toEqual({
    top: 1,
    bottom: 1,
    left: 1,
    right: 1,
  });
  expect(setMarginLinkMode(values, 'none', 'short-edge', dimensions)).toEqual(
    values,
  );
  expect(values.right).toBe(4);
});
it('clamps newly linked axes to leave one pixel inside the photo', () => {
  const result = setMarginLinkMode(
    { top: 5000, bottom: 0, left: 4000, right: 0 },
    'pairs',
    'px',
    { width: 6000, height: 4000 },
  );
  expect(result).toEqual({
    top: 1999.5,
    bottom: 1999.5,
    left: 2999.5,
    right: 2999.5,
  });
});
