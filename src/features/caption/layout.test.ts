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
      10,
      20,
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
      13.5,
      27.25,
    );
    const b = anchoredPosition(
      { width: 2000, height: 3000 },
      { width: 250, height: 50 },
      anchor,
      6.75,
      13.625,
    );
    expect(a.x).toBeCloseTo(b.x * 2);
    expect(a.y).toBeCloseTo(b.y * 2);
  },
);
