import { Tooltip } from './tooltip';
import { ChevronUp, ChevronDown } from 'lucide-react';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type PointerEvent as ReactPointerEvent,
} from 'react';
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
  step = 1,
  suffix,
  stepperLabel = 'value',
  disabled,
  className,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: NumberInputProps) {
  const unitId = useId();
  const activeDragCleanup = useRef<(() => void) | null>(null);
  const suppressNextClick = useRef(false);
  const format = (number: number) => String(Number(number.toFixed(6)));
  const [draft, setDraft] = useState(format(value));
  const [focused, setFocused] = useState(false);
  useEffect(() => () => activeDragCleanup.current?.(), []);
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
  const startStepperDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || disabled) return;
    activeDragCleanup.current?.();
    suppressNextClick.current = false;

    const button = event.currentTarget;
    const drag = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startValue: value,
      moved: false,
    };
    let finished = false;

    const cleanup = (allowClick: boolean) => {
      if (finished) return;
      finished = true;
      if (button.hasPointerCapture(drag.pointerId))
        button.releasePointerCapture(drag.pointerId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      button.removeEventListener('lostpointercapture', onLostPointerCapture);
      if (activeDragCleanup.current === cancelDrag)
        activeDragCleanup.current = null;
      suppressNextClick.current = allowClick;
    };

    const onMove = (moveEvent: globalThis.PointerEvent) => {
      if (moveEvent.pointerId !== drag.pointerId) return;
      const distance = drag.startY - moveEvent.clientY;
      if (!drag.moved && Math.abs(distance) < 4) return;
      drag.moved = true;
      const unitStep = step === 'any' ? 1 : step;
      const steps = Math.trunc(distance / 4);
      const next = Math.min(
        max,
        Math.max(min, Number((drag.startValue + steps * unitStep).toFixed(6))),
      );
      setDraft(format(next));
      onValueChange(next);
    };

    const onUp = (upEvent: globalThis.PointerEvent) => {
      if (upEvent.pointerId === drag.pointerId) cleanup(drag.moved);
    };
    const onCancel = (cancelEvent: globalThis.PointerEvent) => {
      if (cancelEvent.pointerId === drag.pointerId) cleanup(false);
    };
    const onBlur = () => cleanup(false);
    const onVisibilityChange = () => {
      if (document.hidden) cleanup(false);
    };
    const onLostPointerCapture = () => cleanup(false);
    const cancelDrag = () => cleanup(false);

    button.setPointerCapture(drag.pointerId);
    activeDragCleanup.current = cancelDrag;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibilityChange);
    button.addEventListener('lostpointercapture', onLostPointerCapture);
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
        // Custom steppers own increments; manual values may lie between steps.
        step="any"
        disabled={disabled}
        title={props.title ?? `${format(value)}${suffix ? ` ${suffix}` : ''}`}
        onFocus={(event) => {
          setDraft(format(value));
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            nudge(event.key === 'ArrowUp' ? 1 : -1);
          }
        }}
        onChange={(event) => {
          setDraft(event.target.value);
          if (event.target.value === '') return;
          const next = event.target.valueAsNumber;
          if (Number.isFinite(next) && next >= min && next <= max)
            onValueChange(next);
        }}
      />
      <span className="numeric-steppers">
        <Tooltip
          focusWithin
          content={
            value >= max
              ? `Maximum ${stepperLabel.toLowerCase()} reached`
              : `Increase ${stepperLabel.toLowerCase()} · Drag vertically to adjust`
          }
        >
          <span className="flex min-h-0 flex-1">
            <button
              type="button"
              aria-label={`Increase ${stepperLabel}`}
              disabled={disabled || value >= max}
              onPointerDown={startStepperDrag}
              onClickCapture={(event) => {
                if (!suppressNextClick.current) return;
                suppressNextClick.current = false;
                event.preventDefault();
                event.stopPropagation();
              }}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => nudge(1)}
            >
              <ChevronUp aria-hidden="true" />
            </button>
          </span>
        </Tooltip>
        <Tooltip
          focusWithin
          content={
            value <= min
              ? `Minimum ${stepperLabel.toLowerCase()} reached`
              : `Decrease ${stepperLabel.toLowerCase()} · Drag vertically to adjust`
          }
        >
          <span className="flex min-h-0 flex-1">
            <button
              type="button"
              aria-label={`Decrease ${stepperLabel}`}
              disabled={disabled || value <= min}
              onPointerDown={startStepperDrag}
              onClickCapture={(event) => {
                if (!suppressNextClick.current) return;
                suppressNextClick.current = false;
                event.preventDefault();
                event.stopPropagation();
              }}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => nudge(-1)}
            >
              <ChevronDown aria-hidden="true" />
            </button>
          </span>
        </Tooltip>
      </span>
      {suffix && (
        <span
          className={`numeric-unit ${suffix === '×' ? 'numeric-unit-multiplier' : ''}`}
          id={unitId}
        >
          {suffix}
        </span>
      )}
    </div>
  );
}
