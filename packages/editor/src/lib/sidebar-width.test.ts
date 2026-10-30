import { describe, expect, it } from 'vitest';
import { clampSidebarWidth } from './sidebar-width';

describe('sidebar width bounds', () => {
  it('clamps dragging and keyboard changes', () => {
    expect(clampSidebarWidth(100)).toBe(384);
    expect(clampSidebarWidth(900)).toBe(560);
    expect(clampSidebarWidth(420)).toBe(420);
    expect(clampSidebarWidth(NaN)).toBe(384);
  });
});
