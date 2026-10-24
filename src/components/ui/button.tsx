import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'control-button inline-flex items-center justify-center gap-2 text-sm font-medium [&_svg]:size-4',
  {
    variants: {
      variant: {
        default: 'button-primary',
        outline: 'control-neutral',
      },
      size: { default: 'h-10 px-4 py-2', sm: 'h-8 px-3' },
      color: {
        default: '',
        violet: 'button-color-violet',
        turquoise: 'button-color-turquoise',
        yellow: 'button-color-yellow',
        crimson: 'button-color-crimson',
        'rose-brown': 'button-color-rose-brown',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

function Button({
  className,
  variant,
  size,
  color,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      type={asChild ? undefined : 'button'}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, color, className }))}
      {...props}
    />
  );
}

export { Button };
