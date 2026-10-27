import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';

/** Floats above the current workspace without changing its geometry. */
export function PhotoLoadingIndicator({
  label = 'Preparing preview…',
  onCancel,
}: {
  label?: string;
  onCancel?: () => void;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center p-4"
      role="status"
      aria-live="polite"
    >
      <div className="glass-popover pointer-events-auto flex w-64 max-w-full flex-col items-center gap-4 rounded-2xl border border-panel-border px-7 py-6 text-center text-sm text-content-primary shadow-panel">
        <LoaderCircle
          className="size-9 animate-spin text-content-primary motion-reduce:animate-none"
          aria-hidden="true"
        />
        {label}
        {onCancel && (
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
