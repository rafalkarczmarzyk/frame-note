import type { ComponentProps } from 'react';
import { rulerThickness } from './ruler-metrics';
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
        width: horizontal ? length : rulerThickness,
        height: horizontal ? rulerThickness : length,
        ...style,
      }}
      {...props}
    >
      <svg
        width={horizontal ? length : rulerThickness}
        height={horizontal ? rulerThickness : length}
        aria-hidden="true"
        className="pointer-events-none absolute text-content-muted"
      >
        {marks.map(({ position, label }) => (
          <g key={label}>
            <path
              d={
                horizontal
                  ? `M ${position} ${rulerThickness - 4} v 4`
                  : `M ${rulerThickness - 4} ${position} h 4`
              }
              stroke="currentColor"
            />
            <text
              x={horizontal ? position + 3 : 0}
              y={horizontal ? 10 : 0}
              transform={
                horizontal
                  ? undefined
                  : `translate(10 ${position + 3}) rotate(-90)`
              }
              textAnchor={horizontal ? undefined : 'end'}
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
                    d={
                      horizontal
                        ? `M ${offset} ${rulerThickness - 2} v 2`
                        : `M ${rulerThickness - 2} ${offset} h 2`
                    }
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
