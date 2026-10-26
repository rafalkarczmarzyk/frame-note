import type { ComponentProps } from 'react';
import type { Margins } from '@/domain/sizing';
import { cn } from '@/lib/utils';
export function MarginTooltip({
  side,
  value,
  unitLabel,
  className,
  ...props
}: Omit<ComponentProps<'div'>, 'children'> & {
  side: keyof Margins;
  value: number;
  unitLabel: string;
}) {
  return (
    <div
      role="tooltip"
      className={cn(
        'pointer-events-none absolute z-20 whitespace-nowrap rounded-md border border-panel-border glass-popover glass-tooltip px-2 py-1 text-xs text-content-primary shadow-lg',
        className,
      )}
      {...props}
    >
      {side.charAt(0).toUpperCase() + side.slice(1)} margin ·{' '}
      {Number(value.toFixed(6))} {unitLabel}
    </div>
  );
}
