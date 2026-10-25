import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
export interface RulerProps extends ComponentProps<'div'> {
  orientation: 'horizontal' | 'vertical';
  length: number;
  pixelsPerUnit: number;
  active?: boolean;
  unitLabel: string;
}
export function Ruler({
  orientation,
  length,
  pixelsPerUnit,
  active = false,
  unitLabel,
  children,
  className,
  style,
  ...props
}: RulerProps) {
  const horizontal = orientation === 'horizontal';
  const ticks = (length: number) => {
    const raw = 60 / pixelsPerUnit;
    const power = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 5, 10].find((n) => n * power >= raw)! * power;
    return Array.from(
      { length: Math.floor(length / (step * pixelsPerUnit)) + 1 },
      (_, i) => ({
        position: i * step * pixelsPerUnit,
        label: Number((i * step).toPrecision(6)).toString(),
      }),
    );
  };
  const marks = ticks(length);
  return (
    <div
      role="group"
      aria-label={`${horizontal ? 'Horizontal' : 'Vertical'} margin ruler (${unitLabel})`}
      className={cn(
        'pointer-events-auto relative bg-sidebar-base text-content-secondary',
        active ? 'opacity-100' : 'opacity-60',
        className,
      )}
      style={{
        width: horizontal ? length : 28,
        height: horizontal ? 28 : length,
        ...style,
      }}
      {...props}
    >
      <svg
        width={horizontal ? length : 28}
        height={horizontal ? 28 : length}
        aria-hidden="true"
        className="pointer-events-none absolute text-content-muted"
      >
        {marks.map(({ position, label }) => (
          <g key={label}>
            <path
              d={horizontal ? `M ${position} 22 v 6` : `M 22 ${position} h 6`}
              stroke="currentColor"
            />
            <text
              x={horizontal ? position + 3 : 3}
              y={horizontal ? 12 : position + 12}
              fontSize="9"
              fill="currentColor"
            >
              {label}
            </text>
            {[1, 2, 3, 4].map((minor) => {
              const offset =
                position + (minor * (marks[1]?.position ?? length)) / 5;
              return (
                offset < length && (
                  <path
                    key={minor}
                    d={horizontal ? `M ${offset} 25 v 3` : `M 25 ${offset} h 3`}
                    stroke="currentColor"
                  />
                )
              );
            })}
          </g>
        ))}
      </svg>
      {children}
    </div>
  );
}
