import { Slot } from '@radix-ui/react-slot';
import {
  cloneElement,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

/** Descriptive help for one focusable control; never put interactive content inside. */
export function Tooltip({
  children,
  content,
  delay = 450,
}: {
  children: ReactElement<{ 'aria-describedby'?: string }>;
  content: ReactNode;
  delay?: number;
}) {
  const id = useId();
  const trigger = useRef<HTMLElement>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focused = useRef(false);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const dismiss = useCallback(() => {
    clear();
    setOpen(false);
  }, [clear]);
  const leave = () => {
    clear();
    if (!focused.current) timer.current = setTimeout(() => setOpen(false), 120);
  };
  useLayoutEffect(() => () => clear(), [clear]);
  useLayoutEffect(() => {
    if (!open || !bubble.current) return;
    const panel = bubble.current;
    panel.showPopover();
    const place = () => {
      if (!trigger.current) return;
      const box = trigger.current.getBoundingClientRect();
      const bounds = panel.getBoundingClientRect();
      setPosition({
        left: Math.max(
          8,
          Math.min(
            box.left + (box.width - bounds.width) / 2,
            window.innerWidth - bounds.width - 8,
          ),
        ),
        top: Math.max(
          8,
          Math.min(
            box.top >= bounds.height + 16
              ? box.top - bounds.height - 8
              : box.bottom + 8,
            window.innerHeight - bounds.height - 8,
          ),
        ),
      });
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        dismiss();
      }
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    document.addEventListener('keydown', escape, true);
    return () => {
      panel.hidePopover();
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      document.removeEventListener('keydown', escape, true);
    };
  }, [open, dismiss]);
  return (
    <>
      <Slot
        ref={trigger}
        onPointerEnter={(event) => {
          if (event.pointerType === 'touch') return;
          clear();
          timer.current = setTimeout(() => setOpen(true), delay);
        }}
        onPointerLeave={leave}
        onFocus={() => {
          focused.current = true;
          clear();
          setOpen(true);
        }}
        onBlur={() => {
          focused.current = false;
          dismiss();
        }}
        onPointerDown={dismiss}
        onClick={dismiss}
      >
        {cloneElement(children, {
          'aria-describedby':
            [children.props['aria-describedby'], open ? id : null]
              .filter(Boolean)
              .join(' ') || undefined,
        })}
      </Slot>
      {open &&
        createPortal(
          <div
            ref={bubble}
            id={id}
            role="tooltip"
            popover="manual"
            onPointerEnter={clear}
            onPointerLeave={leave}
            className="glass-popover glass-tooltip fixed m-0 w-max max-w-[min(18rem,calc(100vw-16px))] rounded-lg border border-panel-border px-3 py-2 text-xs leading-5 text-panel-text shadow-panel"
            style={position}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}
