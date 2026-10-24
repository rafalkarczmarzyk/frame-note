import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Render prop passes a real label target to either native or Radix controls. */
export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: (id: string, descriptionId: string | undefined) => ReactNode;
  className?: string;
}) {
  const id = useId();
  const descriptionId = hint || error ? `${id}-description` : undefined;
  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={id} className="block text-xs text-foreground/75">
        {label}
      </label>
      {children(id, descriptionId)}
      {(error || hint) && (
        <p
          id={descriptionId}
          className="text-xs leading-5 text-foreground/70"
          role={error ? 'alert' : undefined}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}
