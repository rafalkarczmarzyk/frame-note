import { createRequire } from 'node:module';
import { expect, it } from 'vitest';
const { restoreWindowGeometry, startupWindowGeometry } = createRequire(
  import.meta.url,
)('../apps/desktop/window-geometry.cjs');
const primary = { id: 1, workArea: { x: 0, y: 25, width: 1440, height: 875 } };
const secondary = {
  id: 2,
  workArea: { x: -1920, y: 0, width: 1920, height: 1080 },
};
const fallback = { x: 10, y: 25, width: 1400, height: 850 };
it('preserves normal bounds on a connected secondary display', () => {
  const saved = {
    x: -1800,
    y: 50,
    width: 1200,
    height: 800,
    displayId: 2,
    maximized: true,
  };
  expect(
    restoreWindowGeometry(saved, [primary, secondary], primary, fallback),
  ).toEqual({ x: -1800, y: 50, width: 1200, height: 800 });
});
it('moves an absent monitor window fully onto the primary work area', () => {
  const saved = { x: -1800, y: -100, width: 2240, height: 1560, displayId: 2 };
  expect(restoreWindowGeometry(saved, [primary], primary, fallback)).toEqual({
    x: 0,
    y: 25,
    width: 1440,
    height: 875,
  });
});
it('clamps offscreen coordinates and supports small work areas', () => {
  expect(
    restoreWindowGeometry(
      { x: 9000, y: 9000, width: 1000, height: 600, displayId: 1 },
      [primary],
      primary,
      fallback,
    ),
  ).toEqual({ x: 440, y: 300, width: 1000, height: 600 });
  const tiny = { id: 3, workArea: { x: 0, y: 0, width: 640, height: 480 } };
  expect(
    restoreWindowGeometry(
      { x: 50, y: 50, width: 800, height: 600 },
      [],
      tiny,
      fallback,
    ),
  ).toEqual({ x: 0, y: 0, width: 640, height: 480 });
});
it('uses default geometry when remembering is disabled or there is no saved window', () => {
  expect(
    restoreWindowGeometry(undefined, [primary], primary, fallback),
  ).toEqual(fallback);
});

it('limits the default window to 85% of the pointer display work area', () => {
  expect(startupWindowGeometry(undefined, [primary], primary, primary)).toEqual(
    { x: 108, y: 91, width: 1224, height: 743 },
  );
  expect(
    startupWindowGeometry(undefined, [primary, secondary], primary, secondary),
  ).toEqual({ x: -1776, y: 81, width: 1632, height: 918 });
});

it('limits saved windows on connected and disconnected displays', () => {
  const saved = {
    x: -1800,
    y: 0,
    width: 1800,
    height: 1000,
    displayId: 2,
    maximized: true,
  };
  expect(
    startupWindowGeometry(saved, [primary, secondary], primary, primary),
  ).toEqual({ x: -1776, y: 81, width: 1632, height: 918 });
  expect(startupWindowGeometry(saved, [primary], primary, primary)).toEqual({
    x: 108,
    y: 91,
    width: 1224,
    height: 743,
  });
});

it('preserves smaller saved bounds and applies the limit even on tiny work areas', () => {
  const saved = {
    x: 100,
    y: 50,
    width: 900,
    height: 650,
    displayId: 1,
    maximized: true,
  };
  expect(startupWindowGeometry(saved, [primary], primary, primary)).toEqual({
    x: 100,
    y: 50,
    width: 900,
    height: 650,
  });
  const tiny = { id: 3, workArea: { x: 0, y: 0, width: 640, height: 480 } };
  expect(startupWindowGeometry(undefined, [tiny], tiny, tiny)).toEqual({
    x: 48,
    y: 36,
    width: 544,
    height: 408,
  });
});
