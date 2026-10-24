import * as ToggleGroup from '@radix-ui/react-toggle-group';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  content?: ReactNode;
  title?: string;
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
      className={cn('flex overflow-hidden rounded-sm border', className)}
    >
      {options.map((option) => (
        <ToggleGroup.Item
          key={option.value}
          value={option.value}
          aria-label={option.label}
          title={option.title ?? option.label}
          className="flex h-9 min-w-0 flex-1 items-center justify-center gap-1 border-r px-2 text-xs outline-none last:border-r-0 hover:bg-secondary hover:text-secondary-foreground focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset data-[state=on]:bg-primary data-[state=on]:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4"
        >
          {option.content ?? option.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
