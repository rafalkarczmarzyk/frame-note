import { ChevronUp, ChevronDown } from 'lucide-react';
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
  stepperLabel?: string;
}

/** Numeric editing shared by plain numbers and values with a fixed unit. */
export function NumberInput({
  value,
  onValueChange,
  min,
  max,
  step = 0.01,
  suffix,
  stepperLabel,
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
  const nudge = (direction: number) => {
    const next = Math.min(
      max,
      Math.max(
        min,
        Number((value + direction * (step === 'any' ? 1 : step)).toFixed(6)),
      ),
    );
    setDraft(format(next));
    onValueChange(next);
  };
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
      {stepperLabel && (
        <span className="numeric-steppers">
          <button
            type="button"
            aria-label={`Increase ${stepperLabel}`}
            disabled={disabled || value >= max}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => nudge(1)}
          >
            <ChevronUp aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Decrease ${stepperLabel}`}
            disabled={disabled || value <= min}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => nudge(-1)}
          >
            <ChevronDown aria-hidden="true" />
          </button>
        </span>
      )}
      {suffix && (
        <span className="numeric-unit" id={unitId}>
          {suffix}
        </span>
      )}
    </div>
  );
}
