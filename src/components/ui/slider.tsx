import * as SliderPrimitive from '@radix-ui/react-slider';
import { useState, type ReactNode } from 'react';

export interface SliderMark {
  value: number;
  label?: ReactNode;
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  label,
  id,
  marks = [],
}: {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label: string;
  id?: string;
  /** Optional visual ticks. Values outside min/max are omitted; labels do not snap the slider. */
  marks?: readonly SliderMark[];
}) {
  const [dragging, setDragging] = useState(false);
  const visibleMarks =
    max > min
      ? marks.filter(
          (mark) =>
            Number.isFinite(mark.value) &&
            mark.value >= min &&
            mark.value <= max,
        )
      : [];
  return (
    <div className="slider-field w-full">
      <SliderPrimitive.Root
        id={id}
        data-dragging={dragging && !disabled ? '' : undefined}
        onPointerDownCapture={(event) => {
          if (!disabled && event.button === 0) setDragging(true);
        }}
        onPointerUpCapture={() => setDragging(false)}
        onPointerCancelCapture={() => setDragging(false)}
        onLostPointerCapture={() => setDragging(false)}
        value={[value]}
        onValueChange={(values) => {
          if (values[0] !== undefined) onValueChange(values[0]);
        }}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="control-slider relative flex h-10 w-full touch-none select-none items-center data-[disabled]:opacity-40"
      >
        <SliderPrimitive.Track className="control-slider-track relative h-2 flex-1 rounded-full">
          <SliderPrimitive.Range className="control-slider-range absolute h-full rounded-full" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          aria-label={label}
          className="control-slider-thumb relative block h-5 rounded-full"
        />
      </SliderPrimitive.Root>
      {visibleMarks.length > 0 && (
        <div className="slider-scale" aria-label={`${label} scale`}>
          {visibleMarks.map((mark, index) => (
            <div
              className="slider-mark"
              key={`${mark.value}-${index}`}
              style={{ left: `${((mark.value - min) / (max - min)) * 100}%` }}
            >
              <span className="slider-tick" aria-hidden="true" />
              {mark.label != null && (
                <span className="slider-mark-label">{mark.label}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
