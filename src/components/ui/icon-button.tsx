import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function IconButton({
  label,
  className,
  ...props
}: ComponentProps<'button'> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-sm text-current outline-none hover:bg-secondary/20 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 [&_svg]:size-4',
        className,
      )}
      {...props}
    />
  );
}
