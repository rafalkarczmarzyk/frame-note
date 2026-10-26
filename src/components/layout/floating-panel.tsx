import { X } from 'lucide-react';
import { useId, useLayoutEffect, useRef, type ReactNode } from 'react';
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
  const root = useRef<HTMLElement>(null);
  const opener = useRef(document.activeElement);
  const pointerTarget = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const rememberPointer = (event: PointerEvent) => {
      const button =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>('button')
          : null;
      if (button && !root.current?.contains(button))
        pointerTarget.current = button;
    };
    document.addEventListener('pointerdown', rememberPointer, true);
    return () =>
      document.removeEventListener('pointerdown', rememberPointer, true);
  }, []);
  useLayoutEffect(() => {
    const panel = root.current;
    if (!panel) return;
    if (pointerTarget.current?.isConnected)
      opener.current = pointerTarget.current;
    else if (
      !panel.contains(document.activeElement) &&
      document.activeElement !== document.body
    )
      opener.current = document.activeElement;
    pointerTarget.current = null;
    if (!panel.contains(document.activeElement)) {
      const initial =
        panel.querySelector<HTMLElement>(
          '[data-panel-initial-focus]:not([disabled])',
        ) ??
        panel.querySelector<HTMLElement>(
          'input:not([type="file"]):not([type="hidden"]):not([disabled]), button[aria-pressed]:not([disabled])',
        ) ??
        panel;
      initial.focus({ preventScroll: true });
    }
    return () => {
      const focused = document.activeElement;
      if (!panel.contains(focused) && focused !== document.body) return;
      const trigger = opener.current;
      queueMicrotask(() => {
        // A newly opened panel or an explicit user action owns its own focus.
        if (
          document.activeElement !== focused &&
          document.activeElement !== document.body
        )
          return;
        const target =
          trigger instanceof HTMLElement &&
          trigger.isConnected &&
          trigger !== document.body &&
          trigger !== document.documentElement
            ? trigger
            : (document.querySelector<HTMLElement>('[aria-label="Caption"]') ??
              document.querySelector<HTMLElement>(
                'main button:not([disabled])',
              ));
        target?.focus({ preventScroll: true });
      });
    };
  }, [title]);
  const titleId = useId();
  const descriptionId = useId();
  return (
    <aside
      ref={root}
      tabIndex={-1}
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
        'flex min-h-0 flex-col overflow-hidden text-panel-text',
        surface === 'glass'
          ? 'glass-panel rounded-xl border border-panel-border shadow-panel'
          : 'bg-panel-base',
        className,
      )}
    >
      <header
        className={cn(
          'shrink-0',
          surface === 'glass'
            ? 'border-b border-panel-border bg-panel-header-base p-4'
            : 'mx-3 mt-3 rounded-xl bg-panel-header-base p-4',
        )}
      >
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
        <footer
          className={cn(
            'shrink-0',
            surface === 'glass'
              ? 'border-t border-panel-border p-4'
              : 'mx-3 mb-3 rounded-xl bg-panel-header-base p-3',
          )}
        >
          {footer}
        </footer>
      )}
    </aside>
  );
}
