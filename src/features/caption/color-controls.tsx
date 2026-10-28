import { Tooltip } from '@/components/ui/tooltip';
import { useId, useRef, useState, useLayoutEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { ColorSwatch } from '@/components/ui/color-swatch';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { IconButton } from '@/components/ui/icon-button';
import { Palette, X } from 'lucide-react';
import {
  captionColorLabel,
  normalizeHex,
  type ColorSelectionSource,
} from '@/domain/caption-colors';
import { resolvedColor } from './resolve-color';

export function ColorControls({
  value,
  onChange,
  onBrowse,
  disabled = false,
  selectionSource,
  onSelectionSourceChange,
}: {
  value: string;
  onChange: (color: string) => void;
  onBrowse: () => void;
  disabled?: boolean;
  selectionSource?: ColorSelectionSource;
  onSelectionSourceChange?: (
    source: ColorSelectionSource,
    color: string,
  ) => void;
}) {
  const quickColors = [
    'caption-white',
    'caption-ivory',
    'caption-dark-gray',
    'charcoal',
    'caption-black',
  ];
  const [lastSelection, setLastSelection] = useState<{
    value: string;
    source: ColorSelectionSource;
  } | null>(null);
  const source =
    selectionSource ??
    (lastSelection?.value === value
      ? lastSelection.source
      : normalizeHex(value)
        ? 'custom'
        : quickColors.includes(value)
          ? 'quick'
          : 'palette');
  const markSource = (source: ColorSelectionSource, color: string) => {
    setLastSelection({ value: color, source });
    onSelectionSourceChange?.(source, color);
  };
  const id = useId();
  const popup = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const [draft, setDraft] = useState({ value, text: resolvedColor(value) });
  const [error, setError] = useState('');
  const text = draft.value === value ? draft.text : resolvedColor(value);
  const choose = (hex: string) => {
    markSource('custom', hex);
    onChange(hex);
    setDraft({ value: hex, text: hex });
    setError('');
  };
  const close = () => {
    popup.current?.hidePopover();
    trigger.current?.focus({ preventScroll: true });
  };
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      if (!trigger.current || !popup.current) return;
      const box = trigger.current.getBoundingClientRect();
      const bounds = popup.current.getBoundingClientRect();
      setPosition({
        left: Math.max(
          8,
          Math.min(
            box.right - bounds.width,
            window.innerWidth - bounds.width - 8,
          ),
        ),
        top: Math.max(
          8,
          Math.min(box.bottom + 8, window.innerHeight - bounds.height - 8),
        ),
      });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);
  return (
    <>
      <div
        role="group"
        aria-label="Color"
        className="control-segments flex control-height w-full min-w-0 items-center gap-1 px-1"
      >
        {quickColors.map((color) => (
          <Tooltip key={color} content={captionColorLabel(color)}>
            <button
              type="button"
              aria-label={captionColorLabel(color)}
              aria-pressed={source === 'quick' && value === color}
              disabled={disabled}
              onClick={() => {
                popup.current?.hidePopover();
                markSource('quick', color);
                onChange(color);
              }}
              className={`control-segment flex h-full min-w-0 flex-1 items-center justify-center ${source === 'quick' && value === color ? 'control-selected' : ''}`}
            >
              <ColorSwatch value={color} className="size-6" />
            </button>
          </Tooltip>
        ))}
        <Tooltip
          content={`Custom color · ${normalizeHex(resolvedColor(value)) ?? resolvedColor(value)}`}
        >
          <button
            ref={trigger}
            type="button"
            className={`control-segment flex h-full min-w-0 flex-1 items-center justify-center ${source === 'custom' ? 'control-selected' : ''}`}
            aria-pressed={source === 'custom'}
            aria-label="Custom color"
            data-color-value={value}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={id}
            disabled={disabled}
            onClick={() => {
              if (open) {
                close();
                return;
              }
              setDraft({ value, text: resolvedColor(value) });
              setError('');
              const box = trigger.current!.getBoundingClientRect();
              setPosition({
                left: Math.max(
                  8,
                  Math.min(box.right - 288, window.innerWidth - 296),
                ),
                top: Math.max(
                  8,
                  Math.min(box.bottom + 8, window.innerHeight - 370),
                ),
              });
              popup.current?.showPopover();
            }}
          >
            <span
              aria-hidden="true"
              className="color-spectrum size-6 rounded-full"
            />
          </button>
        </Tooltip>
        <Tooltip content="Color palette">
          <button
            type="button"
            className={`control-segment flex h-full min-w-0 flex-1 items-center justify-center ${source === 'palette' ? 'control-selected' : ''}`}
            aria-pressed={source === 'palette'}
            aria-label="Color"
            aria-haspopup="dialog"
            disabled={disabled}
            onClick={(event) => {
              popup.current?.hidePopover();
              event.currentTarget.focus({ preventScroll: true });
              onBrowse();
            }}
          >
            <span className="flex size-7 items-center justify-center rounded-full border border-panel-border bg-button-secondary-base">
              <Palette aria-hidden="true" className="size-5" />
            </span>
          </button>
        </Tooltip>
      </div>
      <div
        ref={popup}
        id={id}
        popover="auto"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            close();
          }
        }}
        role="dialog"
        aria-label="Custom color"
        onToggle={(event) => setOpen(event.newState === 'open')}
        className="fixed m-0 max-h-[calc(100dvh-16px)] w-72 max-w-[calc(100vw-16px)] overflow-y-auto rounded-xl border border-panel-border glass-popover p-4 text-panel-text shadow-panel"
        style={position}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm">Custom color</h3>
          <IconButton
            tooltip="Close color picker"
            label="Close custom color"
            onClick={close}
          >
            <X aria-hidden="true" />
          </IconButton>
        </div>
        <HexColorPicker
          color={resolvedColor(value)}
          onChange={(hex) => choose(normalizeHex(hex)!)}
          style={{ width: '100%', height: 160 }}
        />
        <div className="mt-4">
          <Field
            label="Custom color (HEX)"
            hint="Use 3 or 6 digits, with or without #."
            error={error}
          >
            {(fieldId, descriptionId) => (
              <div className="flex items-center gap-2">
                <ColorSwatch value={value} />
                <Input
                  autoFocus
                  id={fieldId}
                  aria-describedby={descriptionId}
                  aria-invalid={!!error}
                  value={text}
                  spellCheck={false}
                  autoComplete="off"
                  onChange={(event) => {
                    const input = event.target.value;
                    const hex = normalizeHex(input);
                    setDraft({ value: hex ?? value, text: input });
                    if (hex) {
                      markSource('custom', hex);
                      onChange(hex);
                    }
                    setError('');
                  }}
                  onBlur={() => {
                    const hex = normalizeHex(text);
                    if (hex) choose(hex);
                    else
                      setError('Enter a valid HEX color using 3 or 6 digits.');
                  }}
                />
              </div>
            )}
          </Field>
        </div>
      </div>
    </>
  );
}
