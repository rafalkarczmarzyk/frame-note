import { useState, type ReactNode } from 'react';
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
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border-subtle bg-header-base px-3 text-content-primary sm:gap-4 sm:px-5">
      <button
        type="button"
        aria-label="About FrameNote"
        title="About FrameNote"
        className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus-ring"
        onClick={() => setAboutOpen(true)}
      >
        <FrameNoteLogo className="hidden h-[22px] w-auto sm:block" />
        <FrameNoteIcon className="size-[22px] sm:hidden" />
      </button>
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
        <div className="flex shrink-0 items-center border-l border-border-subtle pl-2 sm:pl-3">
          {children}
        </div>
      )}
    </header>
  );
}
