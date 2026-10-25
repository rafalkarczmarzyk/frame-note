import { afterEach, expect, it, vi } from 'vitest';
import { createId } from './create-id';
afterEach(() => vi.unstubAllGlobals());
it('builds a fixed-width ID with getRandomValues alone, including zero padding', () => {
  vi.stubGlobal('crypto', {
    getRandomValues: (values: Uint32Array) => {
      values.set([0, 1, 0x12345678, 0xffffffff]);
      return values;
    },
  });
  expect(createId()).toBe('000000000000000112345678ffffffff');
});
