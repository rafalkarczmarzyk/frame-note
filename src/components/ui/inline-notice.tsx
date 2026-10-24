import type { ReactNode } from 'react';
import { TriangleAlert, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function InlineNotice({
  children,
  tone = 'info',
  className,
}: {
  children: ReactNode;
  tone?: 'info' | 'warning' | 'error';
  className?: string;
}) {
  const Icon = tone === 'warning' ? TriangleAlert : Info;
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2 text-xs leading-5',
        tone === 'warning' ? 'text-warning' : 'text-foreground/80',
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
