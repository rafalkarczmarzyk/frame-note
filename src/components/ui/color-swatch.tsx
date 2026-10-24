import { cn } from '@/lib/utils';

export function ColorSwatch({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block size-5 shrink-0 rounded-full border border-border-subtle',
        className,
      )}
      style={{
        backgroundColor: value.startsWith('#')
          ? value
          : `var(--color-${value})`,
      }}
    />
  );
}
