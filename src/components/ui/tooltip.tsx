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

let dismissActiveTooltip: (() => void) | null = null;

/** Descriptive, noninteractive help without a layout wrapper for enabled controls. */
export function Tooltip({
  children,
  content,
  delay = 750,
  disabled = false,
  overflowOnly = false,
  overflowContent,
  selectionActive = false,
  disabledTrigger = false,
  wrapTrigger = false,
  focusWithin = false,
}: {
  children: ReactElement<{ 'aria-describedby'?: string }>;
  content: ReactNode;
  delay?: number;
  disabled?: boolean;
  overflowOnly?: boolean;
  overflowContent?: ReactNode;
  selectionActive?: boolean;
  disabledTrigger?: boolean;
  wrapTrigger?: boolean;
  focusWithin?: boolean;
}) {
  const id = useId();
  const trigger = useRef<HTMLElement>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focused = useRef(false);
  const [portalHost, setPortalHost] = useState<Element>(() => document.body);
  const [open, setOpen] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const dismiss = useCallback(() => {
    clear();
    setOpen(false);
  }, [clear]);
  const show = () => {
    if (disabled) return;
    const element =
      trigger.current?.querySelector<HTMLElement>('[data-tooltip-truncate]') ??
      trigger.current;
    const overflow = !!element && element.scrollWidth > element.clientWidth;
    if (overflowOnly && !overflow) return;
    setPortalHost(trigger.current?.closest('dialog[open]') ?? document.body);
    setOverflowing(overflow);
    setOpen(true);
  };
  const leave = () => {
    clear();
    if (!focused.current) timer.current = setTimeout(() => setOpen(false), 120);
  };
  useLayoutEffect(() => () => clear(), [clear]);
  useLayoutEffect(() => {
    if (!open || disabled || !bubble.current) return;
    if (dismissActiveTooltip !== dismiss) dismissActiveTooltip?.();
    dismissActiveTooltip = dismiss;
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
    document.addEventListener('pointerdown', dismiss, true);
    document.addEventListener('dragstart', dismiss, true);
    return () => {
      if (dismissActiveTooltip === dismiss) dismissActiveTooltip = null;
      panel.hidePopover();
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      document.removeEventListener('keydown', escape, true);
      document.removeEventListener('pointerdown', dismiss, true);
      document.removeEventListener('dragstart', dismiss, true);
    };
  }, [open, disabled, dismiss]);
  useLayoutEffect(() => {
    if (!selectionActive || disabled) return;
    const reveal = (event: KeyboardEvent) => {
      const editor = trigger.current?.closest('[contenteditable="true"]');
      if (!editor?.contains(document.activeElement)) return;
      if (
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)
      )
        setOpen(true);
    };
    document.addEventListener('keyup', reveal);
    return () => {
      document.removeEventListener('keyup', reveal);
      dismiss();
    };
  }, [selectionActive, disabled, dismiss]);
  const target =
    disabledTrigger || wrapTrigger ? (
      <span
        tabIndex={disabledTrigger ? 0 : undefined}
        role="group"
        data-tooltip-trigger-wrapper
        className="inline-flex min-w-0"
      >
        {children}
      </span>
    ) : (
      children
    );
  const help = overflowing && overflowContent ? overflowContent : content;
  const displayHelp =
    typeof help === 'string' && help.length > 500
      ? `${help.slice(0, 500)}…`
      : help;
  return (
    <>
      <Slot
        ref={trigger}
        onPointerEnter={(event) => {
          if (event.pointerType === 'touch' || event.buttons !== 0 || disabled)
            return;
          clear();
          timer.current = setTimeout(show, delay);
        }}
        onPointerLeave={leave}
        onFocus={(event) => {
          if (
            event.target !== event.currentTarget &&
            !wrapTrigger &&
            !focusWithin
          )
            return;
          focused.current = true;
          clear();
          show();
        }}
        onBlur={() => {
          focused.current = false;
          dismiss();
        }}
        onPointerDown={dismiss}
        onClick={dismiss}
      >
        {cloneElement(target, {
          'aria-describedby':
            [target.props['aria-describedby'], open && !disabled ? id : null]
              .filter(Boolean)
              .join(' ') || undefined,
        })}
      </Slot>
      {open &&
        !disabled &&
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
            {displayHelp}
          </div>,
          portalHost,
        )}
    </>
  );
}
