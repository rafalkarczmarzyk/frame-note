import * as React from 'react';
import { buttonContentMode } from './button-content';
import { Slot } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import { buttonVariants } from './button-variants';
import { cn } from '@/lib/utils';

function Button({
  className,
  variant,
  size,
  color,
  asChild = false,
  icon,
  children,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    icon?: React.ReactNode;
  }) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      type={asChild ? undefined : 'button'}
      data-slot="button"
      data-button-content={buttonContentMode(children)}
      className={cn(buttonVariants({ variant, size, color, className }))}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </Comp>
  );
}

export { Button };
