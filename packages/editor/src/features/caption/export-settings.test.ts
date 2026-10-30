import { expect, it } from 'vitest';
import { jpegQuality } from './export-settings';

it.each([
  [1, 0.01],
  [80, 0.8],
  [95, 0.95],
  [100, 1],
])('converts quality %s to %s', (percent, result) => {
  expect(jpegQuality(percent)).toBe(result);
});
it.each([0, 101, -1, 95.5, NaN, Infinity])(
  'rejects invalid JPEG quality %s',
  (percent) => {
    expect(() => jpegQuality(percent)).toThrow();
  },
);
