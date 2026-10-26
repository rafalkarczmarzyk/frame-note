import { LockKeyhole } from 'lucide-react';

export function PhotoDropOverlay() {
  return (
    <div
      className="photo-drop-overlay pointer-events-none absolute inset-0 z-50 p-3 text-drop-text sm:p-5"
      role="status"
    >
      <div className="flex h-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-drop-border p-6 text-center">
        <p className="text-center font-display text-3xl font-normal tracking-tight sm:text-5xl">
          Drop your photo.
        </p>
        <p className="mt-5 text-sm text-drop-secondary">
          Release to open · JPG or PNG
        </p>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-drop-secondary">
          <LockKeyhole className="size-3" aria-hidden="true" />
          Photos stay on your device.
        </p>
      </div>
    </div>
  );
}
