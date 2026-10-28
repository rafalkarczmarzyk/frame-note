import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'control-button inline-flex items-center justify-center gap-2 text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'button-primary',
        outline: 'control-neutral',
      },
      size: { default: 'control-height px-4', sm: 'control-height px-3' },
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
