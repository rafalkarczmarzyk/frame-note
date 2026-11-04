import type { Platform } from './platform-context';
/** Browser OS detection stays at the platform boundary, shared by view adapters. */
export function platformOS(
  platform: Platform,
  browserPlatform = navigator.platform,
): Exclude<Platform, 'web'> {
  if (platform !== 'web') return platform;
  return /Mac|iPhone|iPad/i.test(browserPlatform)
    ? 'macos'
    : /Win/i.test(browserPlatform)
      ? 'windows'
      : 'linux';
}
export function wheelIntent(
  event: Pick<
    WheelEvent,
    'deltaX' | 'deltaY' | 'deltaMode' | 'shiftKey' | 'metaKey' | 'ctrlKey'
  >,
  os: Exclude<Platform, 'web'>,
  pageSize: number,
) {
  const factor =
    event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? pageSize : 1;
  const x = event.deltaX * factor;
  const y = event.deltaY * factor;
  // Browsers report trackpad pinch as ctrl+wheel, including on macOS.
  const zoom = os === 'macos' ? event.metaKey || event.ctrlKey : event.ctrlKey;
  return {
    zoom,
    x: !zoom && event.shiftKey && x === 0 ? y : x,
    y: !zoom && event.shiftKey && x === 0 ? 0 : y,
  };
}
