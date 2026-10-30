import { Tooltip } from '@/components/ui/tooltip';
import {
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
} from 'react';
import { clampSidebarWidth, sidebarWidth } from '@/lib/sidebar-width';
import { cn } from '@/lib/utils';

/** Workspace columns share the available preview area. */
export function EditorWorkspace({
  className,
  ...props
}: ComponentProps<'main'>) {
  return (
    <main
      className={cn(
        'relative flex min-h-0 flex-1 flex-col [--tools-sidebar-width:24rem] md:flex-row',
        className,
      )}
      {...props}
    />
  );
}

export function ToolSidebar({
  className,
  children,
  style,
  ...props
}: ComponentProps<'aside'>) {
  const [keyboardHelp, setKeyboardHelp] = useState(false);
  const [width, setWidth] = useState(sidebarWidth.default);
  const drag = useRef<{ x: number; width: number } | null>(null);
  const currentWidth = useRef(width);
  const update = (value: number) => {
    const next = clampSidebarWidth(value);
    currentWidth.current = next;
    setWidth(next);
  };
  return (
    <aside
      aria-label="Tools"
      style={
        { ...style, '--tools-sidebar-width': `${width}px` } as CSSProperties
      }
      className={cn(
        'relative flex min-h-0 max-h-[50vh] w-full shrink-0 flex-col border-t bg-sidebar-base md:max-h-none md:w-[var(--tools-sidebar-width)] md:border-t-0 md:border-l',
        className,
      )}
      {...props}
    >
      <Tooltip
        content={
          keyboardHelp
            ? 'Arrow keys resize · Home/End set limits · Enter resets'
            : 'Drag to resize · double-click to reset'
        }
      >
        <div
          role="separator"
          aria-label="Sidebar width"
          aria-orientation="vertical"
          aria-valuemin={sidebarWidth.min}
          aria-valuemax={sidebarWidth.max}
          aria-valuenow={width}
          aria-valuetext={`${width} pixels`}
          tabIndex={0}
          onFocus={() => setKeyboardHelp(true)}
          onPointerEnter={() => setKeyboardHelp(false)}
          className="absolute inset-y-0 -left-1 z-10 hidden w-2 touch-none cursor-col-resize hover:bg-input-focus-ring focus-visible:bg-input-focus-ring focus-visible:outline-2 focus-visible:outline-input-focus-ring md:block"
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            event.preventDefault();
            drag.current = { x: event.clientX, width: currentWidth.current };
            event.currentTarget.setPointerCapture(event.pointerId);
            event.currentTarget.focus({ preventScroll: true });
          }}
          onPointerMove={(event) => {
            if (drag.current)
              update(drag.current.width + drag.current.x - event.clientX);
          }}
          onPointerUp={(event) => {
            if (!drag.current) return;
            drag.current = null;
            update(currentWidth.current);
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => {
            drag.current = null;
            update(currentWidth.current);
          }}
          onLostPointerCapture={() => {
            drag.current = null;
          }}
          onDoubleClick={() => update(sidebarWidth.default)}
          onKeyDown={(event) => {
            const next =
              event.key === 'ArrowLeft'
                ? currentWidth.current + 16
                : event.key === 'ArrowRight'
                  ? currentWidth.current - 16
                  : event.key === 'Home'
                    ? sidebarWidth.min
                    : event.key === 'End'
                      ? sidebarWidth.max
                      : event.key === 'Enter'
                        ? sidebarWidth.default
                        : null;
            if (next !== null) {
              event.preventDefault();
              update(next);
            }
          }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-1 rounded-full bg-sidebar-base px-0.5 py-2"
          >
            <span className="size-1 rounded-full bg-content-secondary" />
            <span className="size-1 rounded-full bg-content-secondary" />
            <span className="size-1 rounded-full bg-content-secondary" />
          </span>
        </div>
      </Tooltip>
      {children}
    </aside>
  );
}
