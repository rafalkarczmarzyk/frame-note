import { buttonContentMode } from './button-content';
import { Tooltip } from './tooltip';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  content?: ReactNode;
  title?: string;
  tooltip?: string;
}
export function SegmentedControl<T extends string>({
  label,
  value,
  onValueChange,
  options,
  disabled = false,
  className,
}: {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  options: readonly SegmentOption<T>[];
  disabled?: boolean;
  className?: string;
}) {
  return (
    <ToggleGroup.Root
      type="single"
      aria-label={label}
      value={value}
      onValueChange={(next) => {
        if (next) onValueChange(next as T);
      }}
      disabled={disabled}
      className={cn('control-segments grid control-height gap-1', className)}
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      {options.map((option) => {
        const item = (
          <ToggleGroup.Item
            key={option.value}
            value={option.value}
            data-button-content={buttonContentMode(
              option.content ?? option.label,
            )}
            aria-label={option.label}
            title={option.tooltip ? undefined : (option.title ?? option.label)}
            className="control-segment flex h-full min-w-0 items-center justify-center gap-1 px-2 text-xs"
          >
            {option.content ?? option.label}
          </ToggleGroup.Item>
        );
        return option.tooltip ? (
          <Tooltip key={option.value} content={option.tooltip}>
            {item}
          </Tooltip>
        ) : (
          item
        );
      })}
    </ToggleGroup.Root>
  );
}
