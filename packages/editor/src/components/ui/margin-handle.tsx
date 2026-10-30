import { Tooltip } from './tooltip';
import type { ComponentProps } from 'react';
import type { Margins } from '../../../../core/src/sizing';
import { cn } from '@/lib/utils';
export interface MarginHandleProps extends Omit<
  ComponentProps<'button'>,
  'value'
> {
  side: keyof Margins;
  position: number;
  value: number;
  max: number;
  unitLabel: string;
  active?: boolean;
  showLabel?: boolean;
}
/** Visual handle; the owning editor supplies its value and interaction handlers. */
export function MarginHandle({
  side,
  position,
  value,
  max,
  unitLabel,
  active = false,
  showLabel = false,
  className,
  ...props
}: MarginHandleProps) {
  const horizontal = side === 'left' || side === 'right';
  return (
    <Tooltip
      content={`${side.charAt(0).toUpperCase() + side.slice(1)} margin · ${Number(value.toFixed(6))} ${unitLabel}`}
    >
      <button
        type="button"
        role="slider"
        aria-label={`${side.charAt(0).toUpperCase() + side.slice(1)} margin`}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${Number(value.toFixed(6))} ${unitLabel}`}
        aria-orientation={horizontal ? 'horizontal' : 'vertical'}
        className={cn(
          'absolute z-10 flex touch-none items-center justify-center rounded-sm outline-offset-2 focus-visible:outline-2 focus-visible:outline-input-focus-ring disabled:cursor-default',
          horizontal ? 'cursor-ew-resize' : 'cursor-ns-resize',
          active ? 'text-accent-color' : 'text-content-primary',
          className,
        )}
        style={
          horizontal
            ? { left: position - 16, bottom: 0, width: 32, height: 28 }
            : { top: position - 16, right: 0, width: 28, height: 32 }
        }
        {...props}
      >
        <span
          aria-hidden="true"
          className={`${showLabel ? 'visible' : 'invisible'} pointer-events-none absolute ${horizontal ? 'bottom-[6px] left-1/2 -translate-x-1/2' : 'top-1/2 right-[6px] -translate-y-1/2'} flex size-4 items-center justify-center rounded-sm text-[9px] font-semibold leading-none text-button-primary-text ${active ? 'bg-accent-color' : 'bg-content-primary'}`}
        >
          {side[0]!.toUpperCase()}
        </span>
        <svg
          aria-hidden="true"
          width={horizontal ? 10 : 6}
          height={horizontal ? 6 : 10}
          viewBox={horizontal ? '0 0 10 6' : '0 0 6 10'}
          className="pointer-events-none absolute"
          style={
            horizontal
              ? { bottom: 0, left: 'calc(50% - 5px)' }
              : { right: 0, top: 'calc(50% - 5px)' }
          }
        >
          <path
            d={horizontal ? 'M0 0H10L5 6Z' : 'M0 0V10L6 5Z'}
            fill="currentColor"
          />
        </svg>
      </button>
    </Tooltip>
  );
}
