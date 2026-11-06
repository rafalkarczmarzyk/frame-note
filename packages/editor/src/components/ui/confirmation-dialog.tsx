import { useId, type ReactNode } from 'react';
import { Modal } from './modal';
import { Button } from './button';

/** Mount while a decision is pending; the caller owns the action and errors. */
export function ConfirmationDialog({
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  busy = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm(): void;
  onCancel(): void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  return (
    <Modal
      titleId={titleId}
      descriptionId={descriptionId}
      onClose={onCancel}
      busy={busy}
    >
      <div className="space-y-4 p-8">
        <h2 id={titleId} className="font-display text-xl font-semibold">
          {title}
        </h2>
        <p id={descriptionId} className="text-sm text-content-secondary">
          {description}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={busy} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button disabled={busy} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
