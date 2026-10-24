import { ChevronDown } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { readSectionOpen, saveSectionOpen } from '@/lib/section-preferences';

interface SidebarSectionProps {
  id: string;
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  persist?: boolean;
  children: ReactNode;
}

/** Native details gives keyboard access and keeps editor controls mounted. */
export function SidebarSection({
  id,
  title,
  summary,
  defaultOpen = true,
  persist = true,
  children,
}: SidebarSectionProps) {
  const [open, setOpen] = useState(() => {
    if (!persist) return defaultOpen;
    try {
      return readSectionOpen(window.localStorage, id, defaultOpen);
    } catch {
      return defaultOpen;
    }
  });
  return (
    <details
      open={open}
      onToggle={(event) => {
        const next = event.currentTarget.open;
        setOpen(next);
        try {
          if (persist) saveSectionOpen(window.localStorage, id, next);
        } catch {
          /* Private browsing can block localStorage. */
        }
      }}
      className="group/section border-b"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 text-sm font-medium hover:bg-secondary/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
        <ChevronDown
          aria-hidden="true"
          className="size-3.5 shrink-0 -rotate-90 transition-transform group-open/section:rotate-0 motion-reduce:transition-none"
        />
        <span>{title}</span>
        {!open && summary && (
          <span
            className="ml-auto min-w-0 truncate text-right text-[10px] font-normal text-foreground/70"
            title={summary}
          >
            {summary}
          </span>
        )}
      </summary>
      <div className="px-5 pb-5">{children}</div>
    </details>
  );
}
