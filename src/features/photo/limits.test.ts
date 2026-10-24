import { expect, it } from 'vitest';
import { validateFileSize, validateImageSize } from './limits';
it('accepts both original Lightroom fixtures and the documented upper boundaries', () => {
  expect(() => validateImageSize(5964, 3976)).not.toThrow();
  expect(() => validateImageSize(4000, 6000)).not.toThrow();
  expect(() => validateImageSize(10000, 5000)).not.toThrow();
  expect(() => validateFileSize(100_000_000)).not.toThrow();
});
it.each([0, -1, NaN, Infinity, 100_000_001])(
  'rejects invalid or oversized file length %s',
  (size) => expect(() => validateFileSize(size)).toThrow(),
);
it.each([
  [0, 100],
  [20000, 10],
  [10000, 5001],
  [NaN, 2],
  [1.5, 3],
])('rejects invalid or oversized dimensions %s × %s', (width, height) =>
  expect(() => validateImageSize(width, height)).toThrow(),
);
