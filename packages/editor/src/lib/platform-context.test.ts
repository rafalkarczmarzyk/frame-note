import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { PlatformProvider } from '@/components/platform-provider';
import { usePlatform } from '@/hooks/use-platform';
import type { Platform } from './platform-context';

function PlatformProbe() {
  const { platform, isWeb, isMacOS, isWindows, isLinux } = usePlatform();
  return [platform, isWeb, isMacOS, isWindows, isLinux].join('|');
}

it.each<[Platform, string]>([
  ['web', 'web|true|false|false|false'],
  ['macos', 'macos|false|true|false|false'],
  ['windows', 'windows|false|false|true|false'],
  ['linux', 'linux|false|false|false|true'],
])(
  'exposes only the %s flag for the supplied platform',
  (platform, expected) => {
    expect(
      renderToStaticMarkup(
        createElement(PlatformProvider, {
          platform,
          children: createElement(PlatformProbe),
        }),
      ),
    ).toBe(expected);
  },
);

it('requires an explicit platform instead of guessing from the host system', () => {
  expect(() => renderToStaticMarkup(createElement(PlatformProbe))).toThrow(
    'usePlatform must be used within PlatformProvider',
  );
});

it('allows a desktop preview to override the surrounding web context', () => {
  expect(
    renderToStaticMarkup(
      createElement(PlatformProvider, {
        platform: 'web',
        children: createElement(PlatformProvider, {
          platform: 'macos',
          children: createElement(PlatformProbe),
        }),
      }),
    ),
  ).toBe('macos|false|true|false|false');
});
