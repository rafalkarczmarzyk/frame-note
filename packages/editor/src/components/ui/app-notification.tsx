import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

/** Shared overlay stack, positioned inside the workspace below its toolbar. */
export function AppNotificationStack({ children }: { children: ReactNode }) {
  return (
    <div
      data-app-notifications
      className="pointer-events-none absolute inset-x-3 top-3 z-50 flex max-h-[calc(100%-24px)] flex-col items-center gap-3 overflow-y-auto"
    >
      {children}
    </div>
  );
}

export function AppNotification({
  children,
  icon,
  role = 'status',
  action,
  dismissLabel,
  onDismiss,
}: {
  children: ReactNode;
  icon?: ReactNode;
  role?: 'status' | 'alert';
  action?: { label: string; onClick(): void };
  dismissLabel?: string;
  onDismiss?: () => void;
}) {
  return (
    <div
      role={role}
      className="glass-popover pointer-events-auto flex max-w-full shrink-0 flex-wrap items-center gap-3 rounded-xl border border-panel-border px-4 py-3 text-sm shadow-panel"
    >
      {icon && <span className="shrink-0 [&>svg]:size-4">{icon}</span>}
      <span className="min-w-0 flex-1 break-words">{children}</span>
      {action && (
        <Button size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
      {onDismiss && dismissLabel && (
        <button
          type="button"
          aria-label={dismissLabel}
          className="shrink-0 rounded p-1 text-content-secondary hover:text-content-primary focus-visible:outline-2 focus-visible:outline-input-focus-ring"
          onClick={onDismiss}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
