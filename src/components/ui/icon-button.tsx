import { Tooltip } from './tooltip';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function IconButton({
  label,
  className,
  tooltip,
  title,
  ...props
}: ComponentProps<'button'> & { label: string; tooltip?: string | false }) {
  const button = (
    <button
      type="button"
      aria-label={label}
      title=""
      className={cn(
        'control-button control-quiet inline-flex size-8 shrink-0 items-center justify-center text-current [&_svg]:size-4',
        className,
      )}
      {...props}
    />
  );
  return tooltip === false || title === '' ? (
    button
  ) : (
    <Tooltip content={tooltip || title || label}>{button}</Tooltip>
  );
}
