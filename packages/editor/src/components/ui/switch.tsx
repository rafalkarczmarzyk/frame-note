import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/** Controlled, keyboard-accessible switch with a shared glass material. */
export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  id,
  className,
}: SwitchProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const descriptionId = `${controlId}-description`;
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 text-xs',
        className,
      )}
    >
      <div className="min-w-0">
        <label
          htmlFor={controlId}
          className={cn(
            'block cursor-pointer leading-5',
            disabled && 'cursor-default opacity-50',
          )}
        >
          {label}
        </label>
        {description && (
          <div
            id={descriptionId}
            className="mt-1 leading-5 text-content-secondary"
          >
            {description}
          </div>
        )}
      </div>
      <button
        id={controlId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        aria-describedby={description ? descriptionId : undefined}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className="glass-switch shrink-0"
      >
        <span className="glass-switch-thumb" />
      </button>
    </div>
  );
}
