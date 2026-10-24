import { X } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { IconButton } from '../ui/icon-button';
import { cn } from '@/lib/utils';

export interface FloatingPanelProps {
  id?: string;
  title: string;
  description?: string;
  toolbar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  className?: string;
  surface?: 'glass' | 'solid';
}
/** Non-modal panel. Position is owned by the workspace, content by the feature. */
export function FloatingPanel({
  id,
  title,
  description,
  toolbar,
  footer,
  children,
  onClose,
  className,
  surface = 'glass',
}: FloatingPanelProps) {
  const titleId = useId();
  const descriptionId = useId();
  return (
    <aside
      id={id}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        }
      }}
      className={cn(
        'flex min-h-0 flex-col overflow-hidden rounded-xl border border-panel-border text-panel-text shadow-panel',
        surface === 'glass' ? 'glass-panel' : 'bg-panel-base',
        className,
      )}
    >
      <header className="shrink-0 border-b border-panel-border bg-panel-header-base p-4">
        <div className="flex items-center justify-between gap-3">
          <h2
            id={titleId}
            className="font-display text-xl leading-6 font-normal"
          >
            {title}
          </h2>
          <IconButton label={`Close ${title.toLowerCase()}`} onClick={onClose}>
            <X aria-hidden="true" />
          </IconButton>
        </div>
        {description && (
          <p
            id={descriptionId}
            className="mt-1 text-xs leading-5 text-content-secondary"
          >
            {description}
          </p>
        )}
        {toolbar && <div className="mt-3">{toolbar}</div>}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
        {children}
      </div>
      {footer && (
        <footer className="shrink-0 border-t border-panel-border p-4">
          {footer}
        </footer>
      )}
    </aside>
  );
}
