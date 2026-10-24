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
        'control-button control-quiet inline-flex size-8 shrink-0 items-center justify-center text-current [&_svg]:size-4',
        className,
      )}
      {...props}
    />
  );
}
