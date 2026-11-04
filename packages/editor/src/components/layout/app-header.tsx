import { SettingsDialog } from '@/features/settings/settings-dialog';
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
import { Button } from '@/components/ui/button';

export function AppHeader({
  children,
  photoAction,
  historyAction,
}: {
  children?: ReactNode;
  photoAction?: ReactNode;
  historyAction?: ReactNode;
}) {
  const [aboutOpen, setAboutOpen] = useState(
    () => platformServices().startupAbout?.show ?? false,
  );
  useEffect(() => {
    if (aboutOpen) platformServices().startupAbout?.markShown();
  }, [aboutOpen]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const configuration = platformServices().configuration;
  useEffect(
    () =>
      platformServices().onSettings?.(() => {
        setAboutOpen(false);
        setSettingsOpen(true);
      }),
    [],
  );
  const { platform, isWeb, isMacOS } = usePlatform();
  useEffect(
    () =>
      platformServices().onAbout?.(() => {
        setSettingsOpen(false);
        setAboutOpen(true);
      }),
    [],
  );
  return (
    <>
      {settingsOpen && configuration && (
        <SettingsDialog
          initial={configuration.current()}
          warning={configuration.warning()}
          onSave={(values) => configuration.save(values)}
          onReveal={() => configuration.reveal()}
          onClose={() => setSettingsOpen(false)}
        />
      )}
      {isMacOS && <MacOSTitleBar />}
      <header
        data-platform={platform}
        className={cn(
          'flex shrink-0 items-center gap-2 border-b border-border-subtle bg-header-base text-content-primary sm:gap-4',
          isWeb ? 'h-12 px-3 sm:px-5' : 'p-1.5',
        )}
      >
        {isWeb && (
          <div className="flex shrink-0 items-center gap-1">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAboutOpen(true)}
            >
              About
            </Button>
          </div>
        )}
        {aboutOpen && <AboutSplash onClose={() => setAboutOpen(false)} />}
        {(photoAction || historyAction) && (
          <div className="flex shrink-0 items-center gap-1">
            {photoAction}
            {historyAction}
          </div>
        )}
        <div className="min-w-0 flex-1" />
        <div
          id="preset-actions"
          className="min-w-0 shrink [&:has(>[data-preset-live])>.preset-placeholder]:hidden"
        >
          <div className="preset-placeholder" aria-hidden="true" inert>
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
