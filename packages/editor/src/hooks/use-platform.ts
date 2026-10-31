import { useContext } from 'react';
import { PlatformContext } from '@/lib/platform-context';

export function usePlatform() {
  const platform = useContext(PlatformContext);
  if (platform === undefined)
    throw new Error('usePlatform must be used within PlatformProvider');

  return {
    platform,
    isWeb: platform === 'web',
    isMacOS: platform === 'macos',
    isWindows: platform === 'windows',
    isLinux: platform === 'linux',
  };
}
