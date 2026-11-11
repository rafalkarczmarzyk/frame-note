import { Check, ZoomIn, ZoomOut } from 'lucide-react';
import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { NumberFieldMenu } from '@/components/ui/number-field-menu';
import type { ActionMenuItem } from '@/components/ui/action-menu';
import { NumberField } from '@/components/ui/number-field';
import type { ZoomSetting } from './navigator-state';
import {
  fitScale,
  manualMinimumScale,
  minimumScale,
  zoomLevels,
  type Size,
} from './navigator-geometry';

interface ZoomControlsProps {
  scale: number;
  photo: Size;
  viewport: Size;
  disabled: boolean;
  onZoom: (setting: ZoomSetting, manual?: boolean) => void;
  fit?: boolean;
  label?: string;
}

export function PhotoZoomField({
  scale,
  photo,
  viewport,
  disabled,
  onZoom,
  fit,
  label = 'Zoom percentage',
  className,
  presets,
}: ZoomControlsProps & {
  className?: string;
  presets?: readonly ActionMenuItem[];
}) {
  const percentage = Number((scale * 100).toFixed(2));
  const manualMinimum = manualMinimumScale(photo, viewport);
  const field = {
    label,
    className,
    unit: '%',
    value: percentage,
    min: scale < manualMinimum ? percentage : manualMinimum * 100,
    max: 800,
    step: 1,
    disabled,
    onValueChange: (value: number) => {
      if (fit && scale < manualMinimum && value <= percentage) return;
      onZoom(value / 100, true);
    },
  };
  return presets ? (
    <NumberFieldMenu {...field} menuLabel="Zoom presets" items={presets} />
  ) : (
    <NumberField {...field} hideLabel />
  );
}

export function PhotoZoomSlider({
  scale,
  photo,
  viewport,
  disabled,
  onZoom,
  compact = false,
  fit = false,
  label = 'Photo zoom',
}: ZoomControlsProps & { compact?: boolean }) {
  const percentage = Number((scale * 100).toFixed(2));
  const minimum = minimumScale(photo, viewport);
  const logMinimum = Math.log(minimum);
  const fitAtMinimum = minimum === fitScale(photo, viewport);
  const manualMinimum = manualMinimumScale(photo, viewport);
  const levels = [
    manualMinimum,
    ...zoomLevels.filter((level) => level > manualMinimum),
  ];
  const lower = levels.findLast((level) => level < scale - 1e-8);
  const higher = levels.find((level) => level > scale + 1e-8);
  return (
    <div
      data-photo-view-controls={compact ? '' : undefined}
      className={cn('flex items-center gap-2', compact && 'max-w-80')}
    >
      {compact ? (
        <ZoomOut
          aria-hidden="true"
          className="size-4 shrink-0 text-content-muted"
        />
      ) : (
        <IconButton
          label="Zoom out"
          disabled={disabled || lower === undefined}
          onClick={() => lower !== undefined && onZoom(lower, true)}
        >
          <ZoomOut className="size-4" />
        </IconButton>
      )}
      <Slider
        label={label}
        onKeyDown={(event) => {
          const direction = ['ArrowRight', 'ArrowUp', 'PageUp'].includes(
            event.key,
          )
            ? 1
            : ['ArrowLeft', 'ArrowDown', 'PageDown'].includes(event.key)
              ? -1
              : 0;
          if (event.key === 'Home' || event.key === 'End' || direction) {
            event.preventDefault();
            const step =
              event.key.startsWith('Page') || event.shiftKey ? 10 : 1;
            const next =
              event.key === 'Home'
                ? minimum
                : event.key === 'End'
                  ? 8
                  : scale + (direction * step) / 100;
            if (fitAtMinimum && next <= minimum) onZoom('fit');
            else onZoom(next, true);
          }
        }}
        valueText={`${percentage}%`}
        value={Math.log(scale) - logMinimum}
        min={0}
        max={Math.log(8) - logMinimum}
        step={0.001}
        disabled={disabled}
        onValueChange={(value) => {
          if (fitAtMinimum && value === 0) onZoom('fit');
          else onZoom(Math.exp(value + logMinimum), true);
        }}
      />
      {compact ? (
        <ZoomIn
          aria-hidden="true"
          className="size-4 shrink-0 text-content-muted"
        />
      ) : (
        <IconButton
          label="Zoom in"
          disabled={disabled || higher === undefined}
          onClick={() => higher !== undefined && onZoom(higher, true)}
        >
          <ZoomIn className="size-4" />
        </IconButton>
      )}
      {compact && (
        <PhotoZoomField
          label="Toolbar zoom percentage"
          className="w-32 shrink-0"
          scale={scale}
          photo={photo}
          viewport={viewport}
          fit={fit}
          disabled={disabled}
          onZoom={onZoom}
          presets={[
            {
              label: 'Fit',
              icon: fit ? <Check aria-hidden="true" /> : undefined,
              onSelect: () => onZoom('fit'),
            },
            {
              label: '100%',
              icon:
                !fit && scale === 1 ? <Check aria-hidden="true" /> : undefined,
              onSelect: () => onZoom(1),
            },
          ]}
        />
      )}
    </div>
  );
}
