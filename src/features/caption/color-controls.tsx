import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { captionColorLabel } from '@/domain/caption-colors';
import { QuickColors } from './quick-colors';

export function ColorControls({
  value,
  onChange,
  onBrowse,
  disabled = false,
}: {
  value: string;
  onChange: (color: string) => void;
  onBrowse: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <QuickColors
        label="Color"
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      <Button
        variant="outline"
        size="sm"
        aria-label="Color"
        aria-haspopup="dialog"
        disabled={disabled}
        className="max-w-full text-xs"
        onClick={(event) => {
          event.currentTarget.focus({ preventScroll: true });
          onBrowse();
        }}
      >
        <Palette aria-hidden="true" />
        More colors…
        <span className="truncate text-content-secondary">
          · {captionColorLabel(value)}
        </span>
      </Button>
    </div>
  );
}
