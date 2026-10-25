import { useId, useRef, useState, type ReactNode } from 'react';
import { Check, GripVertical } from 'lucide-react';

export interface PickerItem {
  id: string;
  label: string;
  description?: ReactNode;
  selected?: boolean;
  preview?: ReactNode;
  leading?: ReactNode;
  actions?: ReactNode;
  controlsLeft?: ReactNode;
  muted?: boolean;
}
export function PickerList({
  items,
  onChoose,
  onHover,
  emptyText = 'No matches.',
  selectedLabel = 'Selected',
  selectionTone = 'default',
  onMove,
}: {
  items: readonly PickerItem[];
  onMove?: (id: string, visualIndex: number) => void;
  onChoose: (id: string) => void;
  onHover?: (id: string | null) => void;
  emptyText?: string;
  selectedLabel?: string;
  selectionTone?: 'default' | 'container';
}) {
  const helpId = useId();
  const [announcement, setAnnouncement] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ id: string; gap: number } | null>(null);
  const dragRef = useRef<{ id: string; gap: number } | null>(null);
  const cancel = () => {
    dragRef.current = null;
    setDrag(null);
  };
  return (
    <div ref={root} className="space-y-1">
      {onMove && (
        <span className="sr-only" role="status" aria-live="polite">
          {drag
            ? `Moving ${items.find((item) => item.id === drag.id)?.label}. Position ${drag.gap + 1}.`
            : announcement}
        </span>
      )}
      {items.map((item, index) => (
        <div
          key={item.id}
          data-picker-row={index}
          className={`relative flex items-center gap-1 rounded-lg ${item.selected && selectionTone === 'container' ? '' : 'hover:bg-menu-item-hover'} ${item.selected ? (selectionTone === 'container' ? 'bg-container-settings-base' : 'bg-menu-item-selected') : ''}`}
          onMouseEnter={() => onHover?.(item.id)}
          onMouseLeave={() => onHover?.(null)}
        >
          {drag?.gap === index && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-0.5 right-0 left-0 border-t-2 border-input-focus-ring"
            />
          )}
          {drag?.gap === items.length && index === items.length - 1 && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-0.5 right-0 left-0 border-t-2 border-input-focus-ring"
            />
          )}
          {item.controlsLeft && (
            <div className="shrink-0 pl-1">{item.controlsLeft}</div>
          )}
          {onMove && (
            <button
              type="button"
              aria-label={`Reorder layer ${index + 1}`}
              aria-describedby={helpId}
              className="control-button shrink-0 cursor-grab touch-none rounded p-1 text-content-secondary active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-input-focus-ring"
              onPointerDown={(event) => {
                if (event.button !== 0 || items.length < 2) return;
                event.preventDefault();
                event.currentTarget.focus();
                event.currentTarget.setPointerCapture(event.pointerId);
                dragRef.current = { id: item.id, gap: index };
                setDrag(dragRef.current);
              }}
              onPointerMove={(event) => {
                if (!dragRef.current) return;
                const rows =
                  root.current?.querySelectorAll<HTMLElement>(
                    '[data-picker-row]',
                  );
                if (!rows?.length) return;
                let gap = rows.length;
                for (let row = 0; row < rows.length; row++) {
                  const box = rows[row]!.getBoundingClientRect();
                  if (event.clientY < box.top + box.height / 2) {
                    gap = row;
                    break;
                  }
                }
                const scrollHost = root.current?.closest('aside');
                if (scrollHost) {
                  const bounds = scrollHost.getBoundingClientRect();
                  if (event.clientY < bounds.top + 40)
                    scrollHost.scrollTop -= 12;
                  if (event.clientY > bounds.bottom - 40)
                    scrollHost.scrollTop += 12;
                }
                dragRef.current = { ...dragRef.current, gap };
                setDrag(dragRef.current);
              }}
              onPointerUp={() => {
                const current = dragRef.current;
                if (current) {
                  const from = items.findIndex(
                    (item) => item.id === current.id,
                  );
                  onMove(
                    current.id,
                    current.gap > from ? current.gap - 1 : current.gap,
                  );
                }
                cancel();
              }}
              onPointerCancel={cancel}
              onLostPointerCapture={cancel}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  cancel();
                  return;
                }
                const target =
                  event.key === 'ArrowUp'
                    ? index - 1
                    : event.key === 'ArrowDown'
                      ? index + 1
                      : event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? items.length - 1
                          : null;
                if (target === null) return;
                event.preventDefault();
                cancel();
                if (target >= 0 && target < items.length) {
                  onMove(item.id, target);
                  setAnnouncement(
                    `${item.label} moved to position ${target + 1}.`,
                  );
                }
              }}
            >
              <GripVertical aria-hidden="true" className="size-3.5" />
            </button>
          )}
          <button
            type="button"
            aria-pressed={!!item.selected}
            onClick={() => onChoose(item.id)}
            className={`control-button ${item.muted ? 'text-content-muted' : ''} block min-w-0 flex-1 rounded-lg p-3 text-left ${selectionTone === 'default' ? 'aria-pressed:text-accent-color' : ''}`}
          >
            <span className="flex items-start justify-between gap-2">
              <span className="flex min-w-0 items-center gap-3 text-xs">
                {item.leading}
                <span className="min-w-0 break-all">{item.label}</span>
              </span>
              {item.selected && selectedLabel && (
                <span className="flex shrink-0 items-center gap-1 text-[10px]">
                  <Check aria-hidden="true" className="size-3.5" />
                  {selectedLabel}
                </span>
              )}
            </span>
            {item.description && (
              <span className="mt-1 block break-all text-xs leading-5 text-content-secondary">
                {item.description}
              </span>
            )}
            {item.preview && <span className="mt-3 block">{item.preview}</span>}
          </button>
          {item.actions && <div className="shrink-0 pr-2">{item.actions}</div>}
        </div>
      ))}
      {onMove && (
        <span id={helpId} className="sr-only">
          Drag to reorder. Use Arrow Up, Arrow Down, Home or End to move. Escape
          cancels dragging. Top layers appear in front.
        </span>
      )}
      {items.length === 0 && (
        <p className="p-3 text-xs text-content-secondary">{emptyText}</p>
      )}
    </div>
  );
}
