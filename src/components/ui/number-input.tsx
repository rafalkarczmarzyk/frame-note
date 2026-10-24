import { useId, useState, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export interface NumberInputProps extends Omit<
  ComponentProps<'input'>,
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'min'
  | 'max'
  | 'step'
  | 'type'
  | 'size'
> {
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step?: number | 'any';
  suffix?: string;
}

/** Numeric editing shared by plain numbers and values with a fixed unit. */
export function NumberInput({
  value,
  onValueChange,
  min,
  max,
  step = 0.01,
  suffix,
  disabled,
  className,
  onFocus,
  onBlur,
  ...props
}: NumberInputProps) {
  const unitId = useId();
  const format = (number: number) => String(Number(number.toFixed(6)));
  const [draft, setDraft] = useState(format(value));
  const [focused, setFocused] = useState(false);
  return (
    <div
      className={cn('control-field numeric-input', className)}
      data-disabled={disabled ? '' : undefined}
      data-invalid={
        props['aria-invalid'] === true || props['aria-invalid'] === 'true'
          ? ''
          : undefined
      }
    >
      <input
        {...props}
        aria-describedby={
          [props['aria-describedby'], suffix ? unitId : undefined]
            .filter(Boolean)
            .join(' ') || undefined
        }
        type="number"
        value={focused ? draft : format(value)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        title={`${format(value)}${suffix ? ` ${suffix}` : ''}`}
        onFocus={(event) => {
          setDraft(format(value));
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        onChange={(event) => {
          setDraft(event.target.value);
          if (event.target.value === '') return;
          const next = event.target.valueAsNumber;
          if (Number.isFinite(next) && next >= min && next <= max)
            onValueChange(next);
        }}
      />
      {suffix && (
        <span className="numeric-unit" id={unitId}>
          {suffix}
        </span>
      )}
    </div>
  );
}
