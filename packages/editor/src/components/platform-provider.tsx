import type { ReactNode } from 'react';
import { PlatformContext, type Platform } from '@/lib/platform-context';

export function PlatformProvider({
  platform,
  children,
}: {
  platform: Platform;
  children: ReactNode;
}) {
  return <PlatformContext value={platform}>{children}</PlatformContext>;
}
