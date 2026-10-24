import { useId, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { ColorSwatch } from '@/components/ui/color-swatch';
import { resolveCaptionColor } from '@/domain/caption-colors';
const colors = [
  { value: 'caption-white', label: 'White' },
  { value: 'caption-silver', label: 'Silver' },
  { value: 'caption-gray', label: 'Gray' },
  { value: 'caption-dark-gray', label: 'Dark gray' },
  { value: 'charcoal', label: 'Charcoal' },
  { value: 'caption-black', label: 'Black' },
];
export function QuickColors({
  value,
  onChange,
  disabled = false,
  label = 'Quick colors',
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pickerId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const resolve = (color: string) =>
    resolveCaptionColor(color, (token) =>
      getComputedStyle(document.documentElement).getPropertyValue(
        `--color-${token}`,
      ),
    ).toUpperCase();
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs text-label">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color.value}
            type="button"
            aria-label={`Quick color ${color.label}`}
            title={color.label}
            aria-pressed={resolve(value) === resolve(color.value)}
            disabled={disabled}
            onClick={() => {
              onChange(color.value);
              setOpen(false);
            }}
            className="control-button control-quiet flex size-8 items-center justify-center rounded-lg aria-pressed:outline-2 aria-pressed:outline-input-focus-ring"
          >
            <ColorSwatch value={color.value} className="size-6" />
          </button>
        ))}
        <button
          ref={trigger}
          type="button"
          aria-label="Custom quick color"
          title="Custom color"
          aria-expanded={open}
          aria-controls={pickerId}
          disabled={disabled}
          onClick={() => setOpen((value) => !value)}
          className="control-button control-quiet flex size-8 items-center justify-center rounded-lg aria-expanded:outline-2 aria-expanded:outline-input-focus-ring"
        >
          <span
            aria-hidden="true"
            className="color-spectrum size-6 overflow-hidden rounded-full"
          />
        </button>
      </div>
      {open && (
        <div
          id={pickerId}
          role="group"
          aria-label="Custom quick color picker"
          className="rounded-lg border border-panel-border bg-panel-base p-3"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              setOpen(false);
              trigger.current?.focus();
            }
          }}
        >
          <HexColorPicker
            color={resolve(value)}
            onChange={(color) => onChange(color.toUpperCase())}
            style={{ width: '100%', height: 140 }}
          />
        </div>
      )}
    </fieldset>
  );
}
