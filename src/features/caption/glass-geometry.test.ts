import { describe, expect, it } from 'vitest';
import { glassSampleRect } from './glass-geometry';

describe('glass sampling region', () => {
  const dimensions = { width: 1200, height: 800 };
  it('includes surrounding pixels for blur and rounds outwards', () => {
    expect(
      glassSampleRect(
        { x: 100.5, y: 80.5, width: 200, height: 100 },
        10,
        dimensions,
      ),
    ).toEqual({ x: 68, y: 48, width: 265, height: 165 });
  });
  it('clips sampling at the photo edge without moving the panel', () => {
    expect(
      glassSampleRect(
        { x: -10, y: 780, width: 200, height: 100 },
        10,
        dimensions,
      ),
    ).toEqual({ x: 0, y: 748, width: 222, height: 52 });
  });
  it('skips panels entirely outside the sampling area', () => {
    expect(
      glassSampleRect(
        { x: 2000, y: 50, width: 100, height: 100 },
        10,
        dimensions,
      ),
    ).toBeNull();
  });
});
