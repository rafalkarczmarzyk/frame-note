import { describe, expect, it } from 'vitest';
// @ts-expect-error The desktop test helper is plain JavaScript.
import { assertDesktopTestEnvironment } from '../scripts/desktop-test-environment.mjs';

describe('desktop test environment', () => {
  it('blocks the Codex macOS sandbox before Electron can start', () => {
    expect(() =>
      assertDesktopTestEnvironment('darwin', { CODEX_SANDBOX: 'seatbelt' }),
    ).toThrow('blocked before launching Electron');
  });

  it('blocks an application sandbox as well', () => {
    expect(() =>
      assertDesktopTestEnvironment('darwin', {
        APP_SANDBOX_CONTAINER_ID: 'test.container',
      }),
    ).toThrow('blocked before launching Electron');
  });

  it('allows macOS without sandbox markers, including network-only restrictions', () => {
    expect(() =>
      assertDesktopTestEnvironment('darwin', {
        CODEX_SANDBOX_NETWORK_DISABLED: '1',
      }),
    ).not.toThrow();
  });

  it.each(['linux', 'win32'])(
    'rejects unsupported %s smoke tests',
    (platform) => {
      expect(() => assertDesktopTestEnvironment(platform, {})).toThrow(
        'require a macOS graphical session',
      );
    },
  );
});
