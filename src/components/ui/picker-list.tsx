import { Tooltip } from './tooltip';
import { edgeScrollSpeed, scrollAncestor } from '@/lib/drag-scroll';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type ComponentProps,
} from 'react';
import { Check, GripVertical } from 'lucide-react';

export interface PickerItem {
  id: string;
  label: string;
  tooltip?: string;
  /** Optional visual summary; label remains the accessible text. */
  content?: ReactNode;
  description?: ReactNode;
  selected?: boolean;
  preview?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
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
  controlsLayout = 'inline',
  appearance = 'default',
  density = 'default',
  reorderHandle = 'grip',
}: {
  appearance?: 'default' | 'compact';
  density?: 'default' | 'dense';
  reorderHandle?: 'grip' | 'row';
  controlsLayout?: 'inline' | 'grid';
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
  const pending = useRef<{
    id: string;
    index: number;
    x: number;
    y: number;
  } | null>(null);
  const suppressClick = useRef(false);
  const pointerY = useRef(0);
  const scrollHost = useRef<HTMLElement | null>(null);
  const updateGap = useCallback((y: number) => {
    const current = dragRef.current;
    const rows =
      root.current?.querySelectorAll<HTMLElement>('[data-picker-row]');
    if (!current || !rows?.length) return;
    let gap = rows.length;
    for (let row = 0; row < rows.length; row++) {
      const box = rows[row]!.getBoundingClientRect();
      if (y < box.top + box.height / 2) {
        gap = row;
        break;
      }
    }
    if (current.gap !== gap) {
      dragRef.current = { ...current, gap };
      setDrag(dragRef.current);
    }
  }, []);
  const draggingId = drag?.id;
  useEffect(() => {
    if (!draggingId) return;
    let frame = 0;
    const tick = () => {
      if (!dragRef.current) return;
      const host = scrollHost.current;
      if (host) {
        const bounds = host.getBoundingClientRect();
        host.scrollTop += edgeScrollSpeed(
          pointerY.current,
          Math.max(0, bounds.top),
          Math.min(window.innerHeight, bounds.bottom),
        );
      }
      updateGap(pointerY.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [draggingId, updateGap]);
  const cancel = () => {
    pending.current = null;
    dragRef.current = null;
    setDrag(null);
  };
  return (
    <div
      ref={root}
      className={appearance === 'compact' ? 'space-y-0.5' : 'space-y-1'}
    >
      {onMove && (
        <span className="sr-only" role="status" aria-live="polite">
          {drag
            ? `Moving ${items.find((item) => item.id === drag.id)?.label}. Position ${drag.gap + 1}.`
            : announcement}
        </span>
      )}
      {items.map((item, index) => {
        const focusMoved = () =>
          requestAnimationFrame(() => {
            const row = Array.from(
              root.current?.querySelectorAll<HTMLElement>('[data-picker-id]') ??
                [],
            ).find((element) => element.dataset.pickerId === item.id);
            const target = row?.querySelector<HTMLButtonElement>(
              reorderHandle === 'row'
                ? '[data-picker-choice]'
                : '[data-reorder-handle]',
            );
            target?.focus({ preventScroll: true });
            target?.scrollIntoView({ block: 'nearest' });
          });
        const reorderProps: ComponentProps<'button'> = {
          onPointerDown: (event) => {
            if (!onMove || event.button !== 0 || items.length < 2) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            if (reorderHandle === 'row') {
              pending.current = {
                id: item.id,
                index,
                x: event.clientX,
                y: event.clientY,
              };
              return;
            }
            event.preventDefault();
            event.currentTarget.focus();
            pointerY.current = event.clientY;
            scrollHost.current = scrollAncestor(root.current);
            dragRef.current = { id: item.id, gap: index };
            setDrag(dragRef.current);
          },
          onPointerMove: (event) => {
            const start = pending.current;
            if (
              start &&
              Math.hypot(event.clientX - start.x, event.clientY - start.y) >= 4
            ) {
              pending.current = null;
              suppressClick.current = true;
              event.currentTarget.focus({ preventScroll: true });
              scrollHost.current = scrollAncestor(root.current);
              dragRef.current = { id: start.id, gap: start.index };
              setDrag(dragRef.current);
            }
            if (!dragRef.current) return;
            pointerY.current = event.clientY;
            updateGap(event.clientY);
          },
          onPointerUp: () => {
            const current = dragRef.current;
            if (current && onMove) {
              const from = items.findIndex((entry) => entry.id === current.id);
              onMove(
                current.id,
                current.gap > from ? current.gap - 1 : current.gap,
              );
              if (reorderHandle === 'row') focusMoved();
            }
            cancel();
            // Native click follows pointerup; a drag must not select another layer.
            if (suppressClick.current)
              window.setTimeout(() => {
                suppressClick.current = false;
              }, 0);
          },
          onPointerCancel: () => {
            cancel();
            suppressClick.current = false;
          },
          onLostPointerCapture: () => {
            cancel();
            window.setTimeout(() => {
              suppressClick.current = false;
            }, 0);
          },
          onKeyDown: (event) => {
            if (!onMove) return;
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
              focusMoved();
              setAnnouncement(`${item.label} moved to position ${target + 1}.`);
            }
          },
        };
        const grip = onMove && reorderHandle === 'grip' && (
          <button
            type="button"
            data-reorder-handle=""
            aria-label={`Reorder layer ${index + 1}`}
            aria-describedby={helpId}
            className="control-button inline-flex shrink-0 cursor-grab touch-none items-center justify-center rounded p-1 text-content-secondary active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-input-focus-ring"
            {...reorderProps}
          >
            <GripVertical aria-hidden="true" className="size-3.5" />
          </button>
        );
        return (
          <div
            key={item.id}
            data-picker-row={index}
            data-picker-id={item.id}
            className={`relative flex items-center gap-1 rounded-lg ${appearance === 'compact' ? 'px-1 py-1' : ''} ${item.selected && selectionTone === 'container' ? '' : 'hover:bg-menu-item-hover'} ${item.selected ? (selectionTone === 'container' ? 'bg-container-settings-base' : 'bg-menu-item-selected') : ''}`}
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
            {controlsLayout === 'grid' ? (
              <div className="grid shrink-0 grid-cols-2 gap-0 p-1 [&_button]:size-7">
                {grip}
                {item.controlsLeft}
                <span className="flex size-7 items-center justify-center">
                  {item.trailing}
                </span>
                {item.actions}
              </div>
            ) : (
              <>
                {grip}
                {item.controlsLeft && (
                  <div className="shrink-0">{item.controlsLeft}</div>
                )}
              </>
            )}
            <Tooltip
              disabled={!item.tooltip || !!drag}
              content="Drag to reorder layers"
              overflowContent={item.tooltip?.slice(0, 500)}
            >
              <button
                type="button"
                data-picker-choice=""
                aria-pressed={!!item.selected}
                {...(reorderHandle === 'row' && onMove ? reorderProps : {})}
                aria-describedby={
                  reorderHandle === 'row' && onMove ? helpId : undefined
                }
                aria-label={appearance === 'compact' ? item.label : undefined}

                onClick={(event) => {
                  if (suppressClick.current) {
                    event.preventDefault();
                    suppressClick.current = false;
                    return;
                  }
                  onChoose(item.id);
                }}
                className={`control-button ${item.muted ? 'text-content-muted' : ''} block min-w-0 flex-1 rounded-lg ${appearance === 'compact' ? 'h-10 px-1' : item.content ? 'px-1 py-2' : density === 'dense' ? 'px-3 py-2' : 'p-3'} ${reorderHandle === 'row' ? 'cursor-grab touch-none active:cursor-grabbing' : ''} text-left ${selectionTone === 'default' ? 'aria-pressed:text-accent-color' : ''}`}
              >
                <span
                  className={`flex justify-between gap-2 ${item.trailing && controlsLayout === 'inline' ? 'items-center' : 'items-start'}`}
                >
                  <span
                    className={`flex min-w-0 flex-1 items-center ${appearance === 'compact' ? 'gap-1' : 'gap-2'} text-xs`}
                  >
                    {item.leading}
                    <span
                      data-tooltip-truncate=""
                      className={`min-w-0 flex-1 ${appearance === 'compact' ? 'block truncate' : item.content ? '' : 'break-all'}`}
                    >
                      {item.content ? (
                        <>
                          <span className="sr-only">{item.label}</span>
                          <span aria-hidden="true">{item.content}</span>
                        </>
                      ) : (
                        item.label
                      )}
                    </span>
                  </span>
                  {item.trailing && controlsLayout === 'inline' && (
                    <span className="shrink-0">{item.trailing}</span>
                  )}
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
                {item.preview && (
                  <span
                    className={
                      density === 'dense' ? 'mt-1 block' : 'mt-3 block'
                    }
                  >
                    {item.preview}
                  </span>
                )}
              </button>
            </Tooltip>
            {item.actions && controlsLayout === 'inline' && (
              <div
                className={
                  appearance === 'compact' ? 'shrink-0' : 'shrink-0 pr-2'
                }
              >
                {item.actions}
              </div>
            )}
          </div>
        );
      })}
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
