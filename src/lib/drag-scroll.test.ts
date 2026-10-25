import { expect, it } from 'vitest';
import { edgeScrollSpeed } from './drag-scroll';
it('scrolls only near edges, including outside the viewport', () => {
  expect(edgeScrollSpeed(5, 0, 200)).toBe(-12);
  expect(edgeScrollSpeed(195, 0, 200)).toBe(12);
  expect(edgeScrollSpeed(100, 0, 200)).toBe(0);
  expect(edgeScrollSpeed(-50, 0, 200)).toBe(-12);
  expect(edgeScrollSpeed(250, 0, 200)).toBe(12);
  expect(edgeScrollSpeed(5, 0, 0)).toBe(0);
  expect(edgeScrollSpeed(20, 0, 40)).toBe(0);
});
