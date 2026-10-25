import { useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
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
  const [open, setOpen] = useState(false);
  const disclosureId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  if (compact)
    return (
      <div
        className="relative"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(false);
            event.stopPropagation();
            event.currentTarget.querySelector('button')?.focus();
          }
        }}
      >
        <button
          ref={trigger}
          type="button"
          title={`Color: ${captionColorLabel(value)}`}
          aria-label="Color"
          aria-expanded={open}
          aria-controls={disclosureId}
          disabled={disabled}
          onClick={() => setOpen(!open)}
          className="control-field flex h-9 w-full items-center gap-2 px-2 text-xs"
        >
          <ColorSwatch value={value} className="size-4" />
          <span className="min-w-0 flex-1 truncate text-left">
            {captionColorLabel(value)}
          </span>
          <ChevronDown className="size-3" aria-hidden="true" />
        </button>
        {open && (
          <div
            id={disclosureId}
            className="absolute right-0 z-20 mt-1 w-64 rounded-lg border border-panel-border bg-panel-base p-3 shadow-panel"
          >
            <QuickColors
              value={value}
              onChange={onChange}
              disabled={disabled}
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={disabled}
              onClick={() => {
                trigger.current?.focus({ preventScroll: true });
                setOpen(false);
                onBrowse();
              }}
            >
              <Palette aria-hidden="true" />
              More colors…
            </Button>
          </div>
        )}
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
