import type { ReactNode } from 'react';
import { Tooltip } from './tooltip';
import { NumberField } from './number-field';
import { Slider } from './slider';

/** Consistent labeled slider and numeric input used for inspector adjustments. */
export function RangeField({
  label,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
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
  unit?: string;
  disabled?: boolean;
  inputLabel?: string;
  icon: ReactNode;
  tooltip: string;
}) {
  return (
    <div className="grid grid-cols-[1rem_minmax(0,1fr)_5rem] items-center gap-2">
      <Tooltip content={tooltip}>
        <span className="inline-flex size-4 items-center justify-center text-content-secondary">
          {icon}
        </span>
      </Tooltip>
      <Tooltip content={tooltip}>
        <Slider
          label={label}
          value={value}
          onValueChange={onValueChange}
          min={min}
          max={max}
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
    </div>
  );
}
