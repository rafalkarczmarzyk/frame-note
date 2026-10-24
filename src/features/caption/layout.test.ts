import { expect, it } from 'vitest';
import { anchoredPosition, anchors } from './layout';

it.each([
  ['top-left', 10, 20],
  ['top-center', 450, 20],
  ['top-right', 890, 20],
  ['center-left', 10, 375],
  ['center', 450, 375],
  ['center-right', 890, 375],
  ['bottom-left', 10, 730],
  ['bottom-center', 450, 730],
  ['bottom-right', 890, 730],
] as const)('positions the measured block at %s', (anchor, x, y) => {
  expect(
    anchoredPosition(
      { width: 1000, height: 800 },
      { width: 100, height: 50 },
      anchor,
      { left: 10, right: 10, top: 20, bottom: 20 },
    ),
  ).toEqual({ x, y });
});
it.each(anchors)(
  'scales consistently for %s with fractional margins',
  (anchor) => {
    const a = anchoredPosition(
      { width: 4000, height: 6000 },
      { width: 500, height: 100 },
      anchor,
      { left: 13.5, right: 13.5, top: 27.25, bottom: 27.25 },
    );
    const b = anchoredPosition(
      { width: 2000, height: 3000 },
      { width: 250, height: 50 },
      anchor,
      { left: 6.75, right: 6.75, top: 13.625, bottom: 13.625 },
    );
    expect(a.x).toBeCloseTo(b.x * 2);
    expect(a.y).toBeCloseTo(b.y * 2);
  },
);

it.each([
  ['top-left', 20, 30],
  ['top-center', 430, 30],
  ['top-right', 840, 30],
  ['center-left', 20, 355],
  ['center', 430, 355],
  ['center-right', 840, 355],
  ['bottom-left', 20, 680],
  ['bottom-center', 430, 680],
  ['bottom-right', 840, 680],
] as const)('anchors %s within asymmetric margins', (anchor, x, y) => {
  expect(
    anchoredPosition(
      { width: 1000, height: 800 },
      { width: 100, height: 50 },
      anchor,
      { top: 30, right: 60, bottom: 70, left: 20 },
    ),
  ).toEqual({ x, y });
});
