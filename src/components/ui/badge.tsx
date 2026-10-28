import type { ComponentProps } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export type BadgeTone =
  'neutral' | 'muted' | 'warning' | 'error' | 'accent' | 'inverse';
export function Badge({
  tone = 'muted',
  size = 'sm',
  asChild = false,
  className,
  ...props
}: ComponentProps<'span'> & {
  tone?: BadgeTone;
  size?: 'sm' | 'md' | 'token';
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp
      data-slot="badge"
      data-tone={tone}
      className={cn(
        'badge inline-flex min-w-0 items-center justify-center gap-1 rounded border font-medium align-middle',
        {
          sm: 'px-1.5 py-0.5 text-[10px] leading-none',
          md: 'px-1.5 py-0.5 text-xs leading-5',
          token: 'h-8 gap-1.5 px-2 py-1 text-xs leading-none',
        }[size],
        className,
      )}
      {...props}
    />
  );
}
