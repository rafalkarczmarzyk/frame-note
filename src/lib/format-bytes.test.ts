import { expect, it } from 'vitest';
import { formatBytes } from './format-bytes';
it.each([
  [0, '0 B'],
  [999, '999 B'],
  [1000, '1.00 kB'],
  [4_200_000, '4.20 MB'],
  [1_000_000_000, '1.00 GB'],
] as const)('formats %s', (input, output) =>
  expect(formatBytes(input)).toBe(output),
);
it.each([-1, NaN, Infinity, 1.5])('rejects %s', (value) =>
  expect(() => formatBytes(value)).toThrow(),
);
