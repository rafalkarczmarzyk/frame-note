import type { ReactNode } from 'react';
import { FrameNoteLogo } from '@/components/brand/frame-note-logo';

export function AppHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="flex h-[76px] shrink-0 items-center justify-between bg-header-base px-6 text-content-primary sm:px-10">
      <a
        href="/"
        aria-label="FrameNote home"
        className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus-ring"
      >
        <FrameNoteLogo className="h-8 w-auto text-current" />
      </a>
      {children}
    </header>
  );
}
