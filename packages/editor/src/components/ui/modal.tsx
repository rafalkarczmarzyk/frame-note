import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Native modal containment, neutral initial focus and browser focus restoration. */
export function Modal({
  children,
  titleId,
  descriptionId,
  onClose,
  closeOnBackdrop = false,
  busy = false,
  className,
}: {
  children: ReactNode;
  titleId: string;
  descriptionId?: string;
  onClose(): void;
  closeOnBackdrop?: boolean;
  busy?: boolean;
  className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const element = dialog.current;
    element?.showModal();
    element?.focus({ preventScroll: true });
    return () => {
      if (element?.open) element.close();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      tabIndex={-1}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={busy}
      className={cn(
        'modal-surface fixed inset-0 m-auto max-h-[90svh] w-[min(560px,94vw)] max-w-[94vw] overflow-y-auto rounded-2xl border border-solid border-panel-border bg-app-base p-0 text-content-primary shadow-none outline-none',
        className,
      )}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const root = event.currentTarget;
        const controls = [
          ...root.querySelectorAll<HTMLElement>(
            'button, input, select, textarea, a[href], [tabindex]',
          ),
        ].filter(
          (element) =>
            element.tabIndex >= 0 &&
            !element.matches(':disabled') &&
            !element.closest('[inert]') &&
            element.getClientRects().length > 0 &&
            getComputedStyle(element).visibility !== 'hidden',
        );
        const first = controls[0];
        const last = controls.at(-1);
        if (!first || !last) {
          event.preventDefault();
          root.focus();
          return;
        }
        if (
          event.shiftKey &&
          (event.target === first || event.target === root)
        ) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && event.target === last) {
          event.preventDefault();
          first.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(event) => {
        if (!closeOnBackdrop || busy || event.target !== event.currentTarget)
          return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose();
      }}
    >
      {children}
    </dialog>
  );
}
