import { useEffect, useRef, type ReactNode } from 'react';

export interface HistoryActions {
  beginEdit: (label: string, key?: string) => void;
  finishEdit: () => void;
  finishTyping?: () => void;
  cancelEdit: () => void;
}

/** Owns boundaries shared by numeric fields, sliders, color pickers and canvas.
 * Text content supplies its own transaction boundaries inside CaptionEditor.
 */
export function HistoryInteractions({
  actions,
  children,
}: {
  actions?: HistoryActions;
  children: ReactNode;
}) {
  const pointer = useRef(false);
  useEffect(() => {
    const finish = () => {
      if (!pointer.current) return;
      pointer.current = false;
      actions?.finishEdit();
    };
    const cancel = () => {
      if (!pointer.current) return;
      pointer.current = false;
      actions?.cancelEdit();
    };
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('blur', finish);
    return () => {
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', cancel);
      window.removeEventListener('blur', finish);
    };
  }, [actions]);
  return (
    <div
      className="contents"
      onPointerDownCapture={(event) => {
        const target = event.target as Element;
        if (target.closest('.caption-content-editor')) return;
        actions?.finishEdit();
        if (
          target.closest(
            'canvas, [role="slider"], .numeric-steppers, input[type="color"]',
          )
        ) {
          pointer.current = true;
          actions?.beginEdit('Adjust layout', 'pointer');
        }
      }}
      onFocusCapture={(event) => {
        if (
          event.target instanceof HTMLInputElement &&
          (event.target.type === 'number' ||
            event.target.hasAttribute('data-layout-draft'))
        )
          actions?.beginEdit('Change value', 'number');
      }}
      onBlur={(event) => {
        if (
          event.target instanceof HTMLInputElement &&
          (event.target.type === 'number' ||
            event.target.hasAttribute('data-layout-draft'))
        )
          actions?.finishEdit();
      }}
      onKeyDownCapture={(event) => {
        if (
          event.target instanceof HTMLInputElement &&
          (event.target.type === 'number' ||
            event.target.hasAttribute('data-layout-draft'))
        ) {
          if (event.key === 'Escape') {
            event.preventDefault();
            event.target.dataset.historyCancelled = 'true';
            actions?.cancelEdit();
            event.target.blur();
          } else if (event.key === 'Enter') {
            event.target.blur();
          }
        }
        if (
          (event.target as Element).getAttribute('role') === 'slider' &&
          event.key.startsWith('Arrow')
        )
          actions?.beginEdit('Adjust value', 'slider-key');
      }}
      onKeyUp={(event) => {
        if ((event.target as Element).getAttribute('role') === 'slider')
          actions?.finishEdit();
      }}
    >
      {children}
    </div>
  );
}
