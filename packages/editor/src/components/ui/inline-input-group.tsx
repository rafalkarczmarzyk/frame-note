import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Compact inline wrapper for related controls such as a toggle and its value. */
export function InlineInputGroup({
  children,
  label,
  className,
}: {
  children: ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div
      role={label ? 'group' : undefined}
      aria-label={label}
      className={cn('inline-input-group', className)}
    >
      {children}
    </div>
  );
}
