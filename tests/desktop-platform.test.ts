import { expect, it } from 'vitest';
import { getDesktopPlatform } from '../apps/desktop/src/platform.mts';

it.each([
  ['darwin', 'macos'],
  ['win32', 'windows'],
  ['linux', 'linux'],
])('maps Electron %s to %s', (nativePlatform, expected) => {
  expect(getDesktopPlatform(nativePlatform)).toBe(expected);
});

it('rejects an unsupported desktop OS instead of treating it as web', () => {
  expect(() => getDesktopPlatform('freebsd')).toThrow(
    'Unsupported desktop platform: freebsd',
  );
});
