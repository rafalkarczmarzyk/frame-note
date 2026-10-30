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
      data-button-content="icon"
      aria-label={label}
      title=""
      className={cn(
        'control-button control-quiet inline-flex control-height min-w-10 shrink-0 items-center justify-center px-2 text-current',
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
