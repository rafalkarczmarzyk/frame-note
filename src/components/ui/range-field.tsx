import type { ReactNode } from 'react';
import { Tooltip } from './tooltip';
import { NumberField } from './number-field';
import { Slider } from './slider';
import { InlineInputGroup } from './inline-input-group';

/** Consistent labeled slider and numeric input used for inspector adjustments. */
export function RangeField({
  label,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  sliderMax,
  unit,
  disabled = false,
  inputLabel = `${label} value`,
  icon,
  tooltip,
}: {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  sliderMax?: number;
  unit?: string;
  disabled?: boolean;
  inputLabel?: string;
  icon: ReactNode;
  tooltip: string;
}) {
  return (
    <InlineInputGroup
      label={label}
      className="grid grid-cols-[1rem_minmax(0,1fr)_5rem] gap-2"
    >
      <Tooltip content={tooltip}>
        <span className="inline-flex size-4 items-center justify-center text-content-secondary">
          {icon}
        </span>
      </Tooltip>
      <Tooltip content={tooltip}>
        <Slider
          label={label}
          value={Math.max(min, Math.min(value, sliderMax ?? max))}
          onValueChange={onValueChange}
          min={min}
          max={sliderMax ?? max}
          step={step}
          disabled={disabled}
        />
      </Tooltip>
      <Tooltip content={tooltip}>
        <NumberField
          label={inputLabel}
          hideLabel
          value={value}
          onValueChange={onValueChange}
          min={min}
          max={max}
          step={step}
          unit={unit}
          disabled={disabled}
        />
      </Tooltip>
    </InlineInputGroup>
  );
}
