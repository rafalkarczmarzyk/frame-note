import { describe, expect, it } from 'vitest';
import { adjustNumberInput } from './number-input-value';

describe('numeric step adjustments', () => {
  it.each([
    [20.000169, 1, 0.1, 20.1],
    [83.001185, -1, 0.1, 82.9],
    [20.000169, 12, 0.1, 21.2],
    [-20.000169, -3, 0.1, -20.3],
    [2.137, 1, 0.02, 2.16],
    [2.137, 1, 1, 3],
    [0.000000123, 1, 1e-7, 0.0000002],
  ])('rounds %s plus %s steps of %s to %s', (value, steps, step, expected) => {
    expect(adjustNumberInput(value, steps, step, -100, 100)).toBe(expected);
  });

  it('keeps exact bounds even when they have more precision than the step', () => {
    expect(adjustNumberInput(0.11, -1, 0.1, 0.015, 1)).toBe(0.015);
    expect(adjustNumberInput(0.91, 1, 0.1, 0, 0.995)).toBe(0.995);
  });

  it('preserves fractional precision for unrestricted steps', () => {
    expect(adjustNumberInput(2.137, 1, 'any', 0, 10)).toBe(3.137);
  });
});
