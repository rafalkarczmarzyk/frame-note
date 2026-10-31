import type { Platform } from '../../../packages/editor/src/lib/platform-context.ts';

export function getDesktopPlatform(
  nativePlatform: string,
): Exclude<Platform, 'web'> {
  switch (nativePlatform) {
    case 'darwin':
      return 'macos';
    case 'win32':
      return 'windows';
    case 'linux':
      return 'linux';
    default:
      throw new Error(`Unsupported desktop platform: ${nativePlatform}`);
  }
}
