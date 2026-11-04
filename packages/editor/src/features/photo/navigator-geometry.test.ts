import { describe, expect, it } from 'vitest';
import {
  constrainView,
  manualMinimumScale,
  roundManualScale,
  fitScale,
  minimumScale,
  visiblePhoto,
  zoomView,
} from './navigator-geometry';

describe('Navigator geometry', () => {
  const photo = { width: 2400, height: 1600 };
  const viewport = { width: 600, height: 400 };
  it('uses whole manual percentages above a fractional Fit minimum', () => {
    const size = { width: 403, height: 260 };
    expect(manualMinimumScale(photo, size)).toBe(0.17);
    expect(roundManualScale(0.001, photo, size)).toBe(0.17);
    expect(roundManualScale(1.254, photo, size)).toBe(1.25);
    expect(roundManualScale(1.256, photo, size)).toBe(1.26);
    expect(roundManualScale(1.005, photo, size)).toBe(1.01);
    expect(roundManualScale(99, photo, size)).toBe(8);
  });
  it('fits large photos and never enlarges a small photo', () => {
    expect(fitScale(photo, viewport)).toBe(0.25);
    expect(fitScale({ width: 100, height: 80 }, viewport)).toBe(1);
    expect(minimumScale({ width: 12000, height: 8000 }, viewport)).toBe(0.05);
  });
  it('keeps the image point under the zoom anchor', () => {
    const view = zoomView({ scale: 0.25, x: 0, y: 0 }, 1, photo, viewport, {
      x: 150,
      y: 100,
    });
    expect(view).toEqual({ scale: 1, x: -450, y: -300 });
    expect((150 - view.x) / view.scale).toBe(600);
    expect((100 - view.y) / view.scale).toBe(400);
  });
  it('centers the small axis and clamps both ends of the large axis', () => {
    const panorama = { width: 2400, height: 200 };
    expect(
      constrainView({ scale: 1, x: 900, y: -99 }, panorama, viewport),
    ).toEqual({ scale: 1, x: 0, y: 100 });
    expect(
      constrainView({ scale: 1, x: -9999, y: 99 }, panorama, viewport),
    ).toEqual({ scale: 1, x: -1800, y: 100 });
  });
  it('maps only the visible image intersection into the overview', () => {
    expect(
      visiblePhoto({ scale: 1, x: -450, y: -300 }, photo, viewport),
    ).toEqual({ x: 450, y: 300, width: 600, height: 400 });
    expect(
      visiblePhoto(
        { scale: 1, x: -100, y: 100 },
        { width: 2400, height: 200 },
        viewport,
      ),
    ).toEqual({ x: 100, y: 0, width: 600, height: 200 });
    expect(visiblePhoto({ scale: 0.25, x: 0, y: 0 }, photo, viewport)).toEqual({
      x: 0,
      y: 0,
      width: 2400,
      height: 1600,
    });
  });
  it('limits zoom to dynamic minimum and 800%', () => {
    expect(zoomView({ scale: 1, x: 0, y: 0 }, 99, photo, viewport).scale).toBe(
      8,
    );
    expect(
      zoomView({ scale: 1, x: 0, y: 0 }, 0.001, photo, viewport).scale,
    ).toBe(0.25);
  });
});
