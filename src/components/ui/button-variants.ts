import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
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
