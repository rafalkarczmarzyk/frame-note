import { expect, it, vi } from 'vitest';
import { readSectionOpen, saveSectionOpen } from './section-preferences';

it('stores only section visibility, independently from photo settings', () => {
  const data = new Map<string, string>();
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
  saveSectionOpen(storage, 'photo', false);
  saveSectionOpen(storage, 'typography', true);
  expect(readSectionOpen(storage, 'photo', true)).toBe(false);
  expect(readSectionOpen(storage, 'typography', false)).toBe(true);
  expect(readSectionOpen(storage, 'export', true)).toBe(true);
});
it('falls back safely for invalid values and unavailable storage', () => {
  expect(
    readSectionOpen(
      { getItem: () => 'broken', setItem: vi.fn() },
      'photo',
      false,
    ),
  ).toBe(false);
  const blocked = {
    getItem: () => {
      throw new Error('blocked');
    },
    setItem: () => {
      throw new Error('blocked');
    },
  };
  expect(readSectionOpen(blocked, 'export', true)).toBe(true);
  expect(() => saveSectionOpen(blocked, 'export', false)).not.toThrow();
});
