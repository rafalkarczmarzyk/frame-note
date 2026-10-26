import { cn } from '@/lib/utils';
import * as ToggleGroup from '@radix-ui/react-toggle-group';

export interface FilterCategory {
  value: string;
  label: string;
}
/** Single-select filters: arrows move focus, Space/Enter select; Tab exits. */
export function CategoryFilter({
  categories,
  value = 'all',
  onValueChange,
  label = 'Filter categories',
  allLabel = 'All',
  className,
}: {
  categories: readonly FilterCategory[];
  value?: string;
  onValueChange: (value: string) => void;
  label?: string;
  allLabel?: string;
  className?: string;
}) {
  return (
    <ToggleGroup.Root
      type="single"
      aria-label={label}
      value={value}
      onValueChange={(next) => {
        if (next) onValueChange(next);
      }}
      className={cn('flex min-w-0 flex-wrap gap-1 p-1', className)}
    >
      {[
        { value: 'all', label: allLabel },
        ...categories.filter((c) => c.value !== 'all'),
      ].map((category) => (
        <ToggleGroup.Item
          key={category.value}
          value={category.value}
          className="control-segment max-w-full rounded-full px-3 py-1.5 text-xs break-words focus-visible:outline-2 focus-visible:outline-input-focus-ring"
        >
          {category.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
