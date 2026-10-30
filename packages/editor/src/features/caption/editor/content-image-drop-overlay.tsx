import { ImagePlus } from 'lucide-react';

export function ContentImageDropOverlay() {
  return (
    <div
      className="photo-drop-overlay pointer-events-none absolute inset-0 z-30 rounded-lg p-2 text-drop-text"
      role="status"
    >
      <div className="flex h-full min-h-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-drop-border px-3 py-4 text-center">
        <ImagePlus className="mb-1 size-5" aria-hidden="true" />
        <p className="text-sm font-semibold">Drop an image</p>
        <p className="text-xs text-drop-secondary">
          SVG or PNG · Insert at the cursor
        </p>
      </div>
    </div>
  );
}
