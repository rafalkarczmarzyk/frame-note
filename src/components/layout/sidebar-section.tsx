import { ChevronDown } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { readSectionOpen, saveSectionOpen } from '@/lib/section-preferences';

interface SidebarSectionProps {
  id: string;
  title: string;
  icon?: ReactNode;
  summary?: string;
  defaultOpen?: boolean;
  persist?: boolean;
  children: ReactNode;
}

/** Native details gives keyboard access and keeps editor controls mounted. */
export function SidebarSection({
  id,
  title,
  icon,
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
      className="group/section mx-3 my-3 overflow-hidden rounded-xl bg-accordion-base"
    >
      <summary className="control-disclosure flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 text-xs font-semibold [&::-webkit-details-marker]:hidden">
        {icon && (
          <span
            aria-hidden="true"
            className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accordion-icon-base text-accordion-icon [&_svg]:size-4"
          >
            {icon}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block font-display text-xl leading-6 font-normal text-accordion-label">
            {title}
          </span>
          {!open && summary && (
            <span className="mt-1 block break-words text-[10px] leading-4 font-normal text-content-secondary">
              {summary}
            </span>
          )}
        </span>
        <ChevronDown
          aria-hidden="true"
          className="size-3.5 shrink-0 text-content-muted -rotate-90 transition-transform group-open/section:rotate-0 motion-reduce:transition-none"
        />
      </summary>
      <div className="px-4 pt-2 pb-4">{children}</div>
    </details>
  );
}
