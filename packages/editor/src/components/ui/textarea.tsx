import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'control-field w-full min-w-0 resize-y p-3 text-xs leading-5',
        className,
      )}
      {...props}
    />
  );
}
