import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** The overlay slot is absolute and never participates in preview sizing. */
export function EditorWorkspace({
  className,
  ...props
}: ComponentProps<'main'>) {
  return (
    <main
      className={cn(
        'relative flex min-h-0 flex-1 flex-col [--tools-sidebar-width:20rem] md:flex-row',
        className,
      )}
      {...props}
    />
  );
}

export function ToolSidebar({
  className,
  children,
  ...props
}: ComponentProps<'aside'>) {
  return (
    <aside
      aria-label="Tools"
      className={cn(
        'flex min-h-0 max-h-[50vh] w-full shrink-0 flex-col border-t bg-sidebar-base md:max-h-none md:w-[var(--tools-sidebar-width)] md:border-t-0 md:border-l',
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  );
}
