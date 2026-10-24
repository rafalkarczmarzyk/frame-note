import { FrameNoteIcon } from '@/components/brand/frame-note-icon';

export function PhotoDropOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 bg-secondary p-5 text-secondary-foreground sm:p-8"
      role="status"
    >
      <div className="flex h-full flex-col items-center justify-center rounded-3xl border-[5px] border-dashed border-secondary-foreground p-6">
        <FrameNoteIcon
          width={64}
          height={64}
          className="mb-8 shrink-0"
          aria-hidden="true"
          focusable="false"
        />
        <p className="text-center font-display text-4xl font-normal tracking-tight sm:text-6xl">
          Drop your photo
        </p>
      </div>
    </div>
  );
}
