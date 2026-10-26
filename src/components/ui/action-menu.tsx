import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Ellipsis } from 'lucide-react';
import { IconButton } from './icon-button';

/** Small action menu, kept outside scrolling rows and within the viewport. */
export function ActionMenu({
  label,
  items,
}: {
  label: string;
  items: readonly {
    label: string;
    icon: ReactNode;
    onSelect: () => void;
    disabled?: boolean;
    separatorBefore?: boolean;
  }[];
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const lastItem = useRef(false);
  const close = (restore = false) => {
    setOpen(false);
    if (restore) trigger.current?.focus({ preventScroll: true });
  };
  useLayoutEffect(() => {
    if (!open || !trigger.current || !menu.current) return;
    const place = () => {
      if (!trigger.current || !menu.current) return;
      const box = trigger.current.getBoundingClientRect();
      const bounds = menu.current.getBoundingClientRect();
      setPosition({
        left: Math.max(
          8,
          Math.min(
            box.right - bounds.width,
            window.innerWidth - bounds.width - 8,
          ),
        ),
        top: Math.max(
          8,
          Math.min(
            window.innerHeight - bounds.height - 8,
            box.bottom + bounds.height + 4 > window.innerHeight - 8
              ? box.top - bounds.height - 4
              : box.bottom + 4,
          ),
        ),
      });
    };
    place();
    const buttons = menu.current.querySelectorAll<HTMLButtonElement>(
      '[role="menuitem"]:not(:disabled)',
    );
    buttons[lastItem.current ? buttons.length - 1 : 0]?.focus({
      preventScroll: true,
    });
    // A trigger may still be scrolling into view when its click opens the menu.
    // Follow that movement instead of dismissing the new menu on a late event.
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent | FocusEvent) => {
      if (
        event.target instanceof Node &&
        !menu.current?.contains(event.target) &&
        !trigger.current?.contains(event.target)
      )
        setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
    };
  }, [open]);
  return (
    <>
      <IconButton
        ref={trigger}
        label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => {
          lastItem.current = false;
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
          event.preventDefault();
          lastItem.current = event.key === 'ArrowUp';
          setOpen(true);
        }}
      >
        <Ellipsis />
      </IconButton>
      {open &&
        createPortal(
          <div
            ref={menu}
            id={id}
            role="menu"
            aria-label={label}
            className="fixed z-50 min-w-40 rounded-lg border border-panel-border bg-menu-base p-1 text-menu-text shadow-menu"
            style={position}
            onKeyDown={(event) => {
              const buttons = Array.from(
                menu.current!.querySelectorAll<HTMLButtonElement>(
                  '[role="menuitem"]:not(:disabled)',
                ),
              );
              const index = buttons.indexOf(
                document.activeElement as HTMLButtonElement,
              );
              const next =
                event.key === 'ArrowDown'
                  ? (index + 1) % buttons.length
                  : event.key === 'ArrowUp'
                    ? (index - 1 + buttons.length) % buttons.length
                    : event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? buttons.length - 1
                        : null;
              if (next !== null) {
                event.preventDefault();
                buttons[next]?.focus();
              }
              if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                close(true);
              }
              if (event.key === 'Tab') {
                // Restore the trigger before native Tab moves to its next/previous sibling.
                close(true);
              }
            }}
          >
            {items.map((item) => (
              <div key={item.label}>
                {item.separatorBefore && (
                  <div
                    role="separator"
                    className="my-1 border-t border-panel-border"
                  />
                )}
                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  tabIndex={-1}
                  className="control-button flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs enabled:hover:bg-menu-item-hover disabled:opacity-40 focus-visible:bg-menu-item-hover focus-visible:outline-2 focus-visible:outline-input-focus-ring [&_svg]:size-4"
                  onClick={() => {
                    close(true);
                    item.onSelect();
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
