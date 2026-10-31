import { Tooltip } from '@/components/ui/tooltip';
import { useEffect, useState, type ReactNode } from 'react';
import { platform } from '@/lib/platform';
import { cn } from '@/lib/utils';
import { AboutSplash } from '@/features/about/about-splash';
import { FrameNoteLogo } from '@/components/brand/frame-note-logo';
import { PresetToolbar } from '@/features/presets/preset-toolbar';
import { builtinPresets } from '@/domain/builtin-presets';
import { FrameNoteIcon } from '@/components/brand/frame-note-icon';

export type WindowChrome = 'standard' | 'macos-titlebar';

export function AppHeader({
  children,
  photoAction,
  windowChrome = 'standard',
}: {
  children?: ReactNode;
  photoAction?: ReactNode;
  windowChrome?: WindowChrome;
}) {
  const [aboutOpen, setAboutOpen] = useState(false);
  useEffect(() => platform().onAbout?.(() => setAboutOpen(true)), []);
  return (
    <>
      {windowChrome === 'macos-titlebar' && (
        <div
          data-window-titlebar
          className="app-window-titlebar flex h-7 shrink-0 items-center justify-center bg-header-base px-20 text-xs font-medium text-content-secondary"
        >
          FrameNote
        </div>
      )}
      <header
        data-window-chrome={windowChrome}
        className={cn(
          'flex shrink-0 items-center gap-2 border-b border-border-subtle bg-header-base text-content-primary sm:gap-4',
          windowChrome === 'macos-titlebar' ? 'p-1.5' : 'h-12 px-3 sm:px-5',
        )}
      >
        {windowChrome !== 'macos-titlebar' && (
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
