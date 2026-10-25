import { describe, expect, it } from 'vitest';
import { moveMargin, type Margins } from './sizing';

const dimensions = { width: 6000, height: 4000 };
const margins: Margins = { top: 3, right: 3, bottom: 3, left: 3 };

describe('ruler margin movement', () => {
  it('converts screen distance at preview scale to document units', () => {
    expect(
      moveMargin(margins, 'left', 8, 0.2, 'short-edge', dimensions, 'none'),
    ).toEqual({ ...margins, left: 4 });
    expect(
      moveMargin(margins, 'right', 8, 0.2, 'short-edge', dimensions, 'none')
        .right,
    ).toBe(2);
    expect(
      moveMargin(margins, 'bottom', -8, 0.2, 'short-edge', dimensions, 'none')
        .bottom,
    ).toBe(4);
  });
  it('moves paired margins and all margins by the same inset', () => {
    expect(
      moveMargin(margins, 'top', 8, 0.2, 'short-edge', dimensions, 'pairs'),
    ).toEqual({ top: 4, bottom: 4, left: 3, right: 3 });
    expect(
      moveMargin(margins, 'right', -8, 0.2, 'short-edge', dimensions, 'all'),
    ).toEqual({ top: 4, bottom: 4, left: 4, right: 4 });
  });
  it('clamps both ends and preserves one source pixel even after rounding', () => {
    expect(
      moveMargin(margins, 'left', -10000, 0.2, 'short-edge', dimensions, 'none')
        .left,
    ).toBe(0);
    const result = moveMargin(
      margins,
      'top',
      10000,
      0.2,
      'short-edge',
      dimensions,
      'all',
    );
    expect((result.top + result.bottom) * 40).toBe(3999);
  });
  it('uses pixel steps without rounding the original stored margin on pointer down', () => {
    expect(
      moveMargin(
        { ...margins, left: 120 },
        'left',
        1.2,
        0.2,
        'px',
        dimensions,
        'none',
      ).left,
    ).toBe(126);
    expect(
      moveMargin(margins, 'left', 12, 0.2, 'long-edge', dimensions, 'none')
        .left,
    ).toBe(4);
  });
});
