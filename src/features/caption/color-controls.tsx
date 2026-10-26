import { ColorSwatch } from '@/components/ui/color-swatch';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { captionColorLabel } from '@/domain/caption-colors';
import { QuickColors } from './quick-colors';

export function ColorControls({
  value,
  onChange,
  onBrowse,
  disabled = false,
  compact = false,
}: {
  compact?: boolean;
  value: string;
  onChange: (color: string) => void;
  onBrowse: () => void;
  disabled?: boolean;
}) {
  if (compact)
    return (
      <div
        className="flex items-center gap-2"
        role="group"
        aria-label="Text color"
      >
        {[
          'caption-white',
          'caption-silver',
          'caption-dark-gray',
          'caption-black',
        ].map((color) => (
          <button
            key={color}
            type="button"
            className="control-button control-quiet flex size-8 items-center justify-center rounded-full aria-pressed:outline-2 aria-pressed:outline-input-focus-ring"
            aria-label={captionColorLabel(color)}
            title={captionColorLabel(color)}
            aria-pressed={value === color}
            disabled={disabled}
            onClick={() => onChange(color)}
          >
            <ColorSwatch value={color} className="size-6" />
          </button>
        ))}
        <button
          type="button"
          aria-label="Custom color"
          aria-pressed={
            ![
              'caption-white',
              'caption-silver',
              'caption-dark-gray',
              'caption-black',
            ].includes(value)
          }
          title={captionColorLabel(value)}
          aria-haspopup="dialog"
          disabled={disabled}
          onClick={(event) => {
            event.currentTarget.focus({ preventScroll: true });
            onBrowse();
          }}
          className="control-button control-quiet flex size-8 items-center justify-center rounded-full aria-pressed:outline-2 aria-pressed:outline-input-focus-ring"
        >
          <span
            aria-hidden="true"
            className="color-spectrum size-6 rounded-full"
          />
        </button>
        <Button
          variant="outline"
          size="sm"
          aria-label="Color"
          aria-haspopup="dialog"
          disabled={disabled}
          onClick={(event) => {
            event.currentTarget.focus({ preventScroll: true });
            onBrowse();
          }}
          className="ml-auto h-9"
        >
          <Palette aria-hidden="true" />
          Colors
        </Button>
      </div>
    );
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
