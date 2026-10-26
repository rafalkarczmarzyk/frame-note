import { Tooltip } from '@/components/ui/tooltip';
import { FloatingPanel } from '@/components/layout/floating-panel';
import { ColorSwatch } from '@/components/ui/color-swatch';
import { resolvedColor } from './resolve-color';
import { captionColors, captionColorLabel } from '@/domain/caption-colors';

export function ColorPickerPanel({
  value,
  onChange,
  onClose,
  className,
  surface = 'glass',
}: {
  value: string;
  onChange: (color: string) => void;
  onClose: () => void;
  className?: string;
  surface?: 'glass' | 'solid';
}) {
  return (
    <FloatingPanel
      title="Choose a color"
      description="Selected tones for your caption."
      onClose={onClose}
      className={className}
      surface={surface}
      footer={
        <p className="flex items-center gap-2 text-xs">
          <ColorSwatch value={value} />
          <span>
            {captionColorLabel(value)}{' '}
            <span className="text-content-secondary">
              {resolvedColor(value)}
            </span>
          </span>
        </p>
      }
    >
      <div className="control-segments grid grid-cols-4 gap-1 p-1">
        {captionColors.map((color) => {
          const selected = resolvedColor(color.value) === resolvedColor(value);
          return (
            <Tooltip
              key={color.value}
              content={`${color.label} · ${resolvedColor(color.value)}`}
            >
              <button
                type="button"
                aria-label={color.label}
                aria-pressed={selected}
                onClick={() => onChange(color.value)}
                className={`control-segment flex min-w-0 flex-col items-center gap-2 px-1 py-3 ${selected ? 'control-selected' : ''}`}
              >
                <ColorSwatch value={color.value} className="size-8" />
                <span className="text-center text-[10px] leading-4">
                  {color.label}
                </span>
              </button>
            </Tooltip>
          );
        })}
      </div>
    </FloatingPanel>
  );
}
