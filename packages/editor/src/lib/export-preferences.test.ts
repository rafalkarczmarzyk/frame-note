import { afterEach, expect, it, vi } from 'vitest';
import { browserPlatform, configurePlatform } from './platform';
import { readExportQuality, storeExportQuality } from './export-preferences';
afterEach(() => configurePlatform(browserPlatform));
it('restores valid export quality and keeps preferences separate from presets', () => {
  const setItem = vi.fn();
  configurePlatform({
    ...browserPlatform,
    storage: { getItem: () => '75', setItem },
  });
  expect(readExportQuality()).toBe(75);
  storeExportQuality(60);
  expect(setItem).toHaveBeenCalledWith('framenote.export-quality', '60');
});
it('defaults safely for malformed or unavailable preferences', () => {
  for (const value of [null, 'oops', '0', '101', '0.5']) {
    configurePlatform({
      ...browserPlatform,
      storage: { getItem: () => value, setItem: vi.fn() },
    });
    expect(readExportQuality()).toBe(95);
  }
  configurePlatform({
    ...browserPlatform,
    storage: {
      getItem: () => {
        throw Error('Unavailable');
      },
      setItem: () => {
        throw Error('Full');
      },
    },
  });
  expect(readExportQuality()).toBe(95);
  expect(() => storeExportQuality(75)).not.toThrow();
});
