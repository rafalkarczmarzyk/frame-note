import { describe, expect, it } from 'vitest';
import { platformOS, wheelIntent } from './platform-os';
const wheel = {
  deltaX: 0,
  deltaY: 5,
  deltaMode: 0,
  shiftKey: false,
  metaKey: false,
  ctrlKey: false,
};
describe('view input platform adapter', () => {
  it('resolves desktop and browser OS consistently', () => {
    expect(platformOS('macos', 'Win32')).toBe('macos');
    expect(platformOS('web', 'MacIntel')).toBe('macos');
    expect(platformOS('web', 'Win32')).toBe('windows');
    expect(platformOS('web', 'Linux x86_64')).toBe('linux');
  });
  it('uses Cmd on Mac, Ctrl on Windows/Linux and accepts browser pinch once', () => {
    expect(wheelIntent({ ...wheel, metaKey: true }, 'macos', 400).zoom).toBe(
      true,
    );
    expect(wheelIntent({ ...wheel, metaKey: true }, 'windows', 400).zoom).toBe(
      false,
    );
    for (const os of ['macos', 'windows', 'linux'] as const)
      expect(wheelIntent({ ...wheel, ctrlKey: true }, os, 400).zoom).toBe(true);
  });
  it('normalizes lines/pages and shifts vertical scroll without doubling native deltaX', () => {
    expect(wheelIntent({ ...wheel, deltaMode: 1 }, 'macos', 400).y).toBe(80);
    expect(wheelIntent({ ...wheel, deltaMode: 2 }, 'macos', 400).y).toBe(2000);
    expect(
      wheelIntent({ ...wheel, shiftKey: true }, 'macos', 400),
    ).toMatchObject({ x: 5, y: 0 });
    expect(
      wheelIntent({ ...wheel, deltaX: 3, shiftKey: true }, 'macos', 400),
    ).toMatchObject({ x: 3, y: 5 });
  });
});
