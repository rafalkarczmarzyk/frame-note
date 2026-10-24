import { describe, expect, it } from 'vitest';
import {
  clampSidebarWidth,
  readSidebarWidth,
  saveSidebarWidth,
} from './sidebar-width';

describe('sidebar width preference', () => {
  it('clamps dragging and keyboard changes', () => {
    expect(clampSidebarWidth(100)).toBe(320);
    expect(clampSidebarWidth(900)).toBe(560);
    expect(clampSidebarWidth(420)).toBe(420);
    expect(clampSidebarWidth(NaN)).toBe(384);
  });
  it('handles missing, invalid and obsolete saved values', () => {
    for (const value of [null, '', 'no-width'])
      expect(readSidebarWidth({ getItem: () => value, setItem() {} })).toBe(
        384,
      );
    expect(readSidebarWidth({ getItem: () => '900', setItem() {} })).toBe(560);
  });
  it('persists width and tolerates unavailable storage', () => {
    let saved = '';
    const storage = {
      getItem: () => saved,
      setItem: (_key: string, value: string) => {
        saved = value;
      },
    };
    saveSidebarWidth(storage, 432);
    expect(readSidebarWidth(storage)).toBe(432);
    const blocked = {
      getItem(): string {
        throw Error();
      },
      setItem() {
        throw Error();
      },
    };
    expect(readSidebarWidth(blocked)).toBe(384);
    expect(() => saveSidebarWidth(blocked, 400)).not.toThrow();
  });
});
