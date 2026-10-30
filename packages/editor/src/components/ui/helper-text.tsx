import type { ComponentProps } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Supplementary guidance; connect to its control with aria-describedby. */
export function HelperText({
  className,
  children,
  ...props
}: ComponentProps<'small'>) {
  return (
    <small
      className={cn(
        'flex items-start gap-2 pt-1 text-[11px] leading-[1.5] font-normal text-content-secondary',
        className,
      )}
      {...props}
    >
      <Info
        aria-hidden="true"
        className="mt-0.5 size-3 shrink-0 text-icon-muted"
      />
      <span className="min-w-0">{children}</span>
    </small>
  );
}
