import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      className={cn(
        'control-field control-height w-full min-w-0 px-3 text-xs',
        className,
      )}
      {...props}
    />
  );
}
