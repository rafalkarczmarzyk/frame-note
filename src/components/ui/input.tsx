import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      className={cn('control-field h-9 w-full min-w-0 px-3 text-xs', className)}
      {...props}
    />
  );
}
