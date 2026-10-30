import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { HelperText } from './helper-text';

/** Render prop passes a real label target to either native or Radix controls. */
export function Field({
  label,
  hint,
  error,
  children,
  className,
  hideLabel = false,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: (id: string, descriptionId: string | undefined) => ReactNode;
  className?: string;
  hideLabel?: boolean;
}) {
  const id = useId();
  const descriptionId = hint || error ? `${id}-description` : undefined;
  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={id}
        className={hideLabel ? 'sr-only' : 'block text-xs text-label'}
      >
        {label}
      </label>
      {children(id, descriptionId)}
      {error ? (
        <p
          id={descriptionId}
          className="text-xs leading-5 text-content-secondary"
          role="alert"
        >
          {error}
        </p>
      ) : hint ? (
        <HelperText id={descriptionId}>{hint}</HelperText>
      ) : null}
    </div>
  );
}
