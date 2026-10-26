import { LoaderCircle } from 'lucide-react';

/** Floats above the current workspace without changing its geometry. */
export function PhotoLoadingIndicator({
  label = 'Preparing preview…',
}: {
  label?: string;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex min-w-56 flex-col items-center gap-4 rounded-2xl border border-panel-border bg-panel-base px-7 py-6 text-sm text-content-primary shadow-panel">
        <LoaderCircle
          className="size-9 animate-spin text-content-primary motion-reduce:animate-none"
          aria-hidden="true"
        />
        {label}
      </div>
    </div>
  );
}
