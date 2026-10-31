import { Tooltip } from '@/components/ui/tooltip';
import { useEffect, useState, type ReactNode } from 'react';
import { platform as platformServices } from '@/lib/platform';
import { usePlatform } from '@/hooks/use-platform';
import { MacOSTitleBar } from './macos-title-bar';
import { cn } from '@/lib/utils';
import { AboutSplash } from '@/features/about/about-splash';
import { FrameNoteLogo } from '@/components/brand/frame-note-logo';
import { PresetToolbar } from '@/features/presets/preset-toolbar';
import { builtinPresets } from '@/domain/builtin-presets';
import { FrameNoteIcon } from '@/components/brand/frame-note-icon';

export function AppHeader({
  children,
  photoAction,
}: {
  children?: ReactNode;
  photoAction?: ReactNode;
}) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const { platform, isWeb, isMacOS } = usePlatform();
  useEffect(() => platformServices().onAbout?.(() => setAboutOpen(true)), []);
  return (
    <>
      {isMacOS && <MacOSTitleBar />}
      <header
        data-platform={platform}
        className={cn(
          'flex shrink-0 items-center gap-2 border-b border-border-subtle bg-header-base text-content-primary sm:gap-4',
          isWeb ? 'h-12 px-3 sm:px-5' : 'p-1.5',
        )}
      >
        {isWeb && (
          <Tooltip content="About FrameNote">
            <button
              type="button"
              aria-label="About FrameNote"
              className="control-button control-height inline-flex min-w-10 shrink-0 items-center justify-center px-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus-ring"
              onClick={() => setAboutOpen(true)}
            >
              <span className="inline-flex shrink-0 items-center">
                <FrameNoteLogo className="hidden h-[22px] w-auto sm:block" />
                <FrameNoteIcon className="size-[22px] sm:hidden" />
              </span>
            </button>
          </Tooltip>
        )}
        {aboutOpen && <AboutSplash onClose={() => setAboutOpen(false)} />}
        {photoAction}
        <div className="min-w-0 flex-1" />
        <div
          id="preset-actions"
          className="min-w-0 shrink [&:has(>[data-preset-live])>.preset-placeholder]:hidden"
        >
          <div className="preset-placeholder">
            <PresetToolbar
              selected="builtin-default"
              options={builtinPresets.map((preset) => ({
                value: preset.id,
                label: preset.name,
              }))}
              onSelect={() => {}}
              onSave={() => {}}
              items={[]}
              disabled
            />
          </div>
        </div>
        {children && (
          <div className="flex shrink-0 items-center">{children}</div>
        )}
      </header>
    </>
  );
}
