import { expect, it, vi } from 'vitest';
import { createStartupAbout, startupAboutVersionKey } from './startup-about';
it('records a version only after About was displayed, suppressing restarts and remounts', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value);
    }),
  };
  const first = createStartupAbout(storage, '0.6.0-beta');
  expect(first.show).toBe(true);
  expect(storage.setItem).not.toHaveBeenCalled();
  first.markShown();
  expect(storage.setItem).toHaveBeenCalledWith(
    startupAboutVersionKey,
    '0.6.0-beta',
  );
  expect(first.show).toBe(false);
  expect(createStartupAbout(storage, '0.6.0-beta').show).toBe(false);
  expect(createStartupAbout(storage, '0.7.0-beta').show).toBe(true);
});
it('handles unavailable storage and suppresses repeats for the current launch', () => {
  const state = createStartupAbout(
    {
      getItem() {
        throw Error('Unavailable');
      },
      setItem() {
        throw Error('Unavailable');
      },
    },
    '0.6.0-beta',
  );
  expect(state.show).toBe(true);
  expect(() => state.markShown()).not.toThrow();
  expect(state.show).toBe(false);
});
