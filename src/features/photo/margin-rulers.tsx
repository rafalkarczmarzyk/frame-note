import { Ruler } from '@/components/ui/ruler';
import { MarginHandle } from '@/components/ui/margin-handle';
import { MarginGuides } from '@/components/ui/margin-guides';
import { useRef } from 'react';
import type { ImageDimensions } from '@/domain/document';
import {
  marginSides,
  marginLimits,
  moveMargin,
  pixelsPerUnit,
  sizingLabels,
  type Margins,
  type MarginLinkMode,
  type SizingUnit,
} from '@/domain/sizing';
import {
  isMarginActive,
  useMarginPreview,
} from '@/components/ui/margin-preview-context';

export function MarginRulers({
  dimensions,
  unit,
  margins,
  linkMode,
  scale,
  x,
  y,
  disabled = false,
  onChange,
}: {
  dimensions: ImageDimensions;
  unit: SizingUnit;
  margins: Margins;
  linkMode: MarginLinkMode;
  scale: number;
  x: number;
  y: number;
  disabled?: boolean;
  onChange: (margins: Margins) => void;
}) {
  const preview = useMarginPreview();
  const drag = useRef<{
    side: keyof Margins;
    start: number;
    margins: Margins;
    scale: number;
  } | null>(null);
  const finish = (cancel = false) => {
    if (!drag.current) return;
    if (cancel) onChange(drag.current.margins);
    drag.current = null;
    preview?.drag(null);
  };
  const limits = marginLimits(margins, unit, dimensions, linkMode);
  const factor = pixelsPerUnit(unit, dimensions);
  const width = dimensions.width * scale;
  const height = dimensions.height * scale;
  const positions = {
    left: margins.left * factor * scale,
    right: width - margins.right * factor * scale,
    top: margins.top * factor * scale,
    bottom: height - margins.bottom * factor * scale,
  };
  return (
    <div
      className="pointer-events-none absolute"
      style={{ left: x, top: y, width, height }}
    >
      <span
        aria-hidden="true"
        className={`absolute flex h-7 w-7 items-center justify-center bg-sidebar-base text-[9px] text-content-secondary ${preview?.visible ? 'opacity-100' : 'opacity-60'}`}
        style={{ left: -28, top: -28 }}
      >
        {sizingLabels[unit]}
      </span>
      {(['horizontal', 'vertical'] as const).map((axis) => {
        const horizontal = axis === 'horizontal';
        const length = horizontal ? width : height;
        return (
          <Ruler
            key={axis}
            orientation={axis}
            length={length}
            pixelsPerUnit={factor * scale}
            unitLabel={sizingLabels[unit]}
            active={preview?.visible}
            className="absolute"
            style={horizontal ? { left: 0, top: -28 } : { left: -28, top: 0 }}
            onMouseEnter={() => preview?.hover('ruler')}
            onMouseLeave={() => preview?.hover(null)}
          >
            {marginSides
              .filter((side) =>
                horizontal
                  ? side === 'left' || side === 'right'
                  : side === 'top' || side === 'bottom',
              )
              .map((side) => (
                <MarginHandle
                  key={side}
                  side={side}
                  position={positions[side]}
                  value={margins[side]}
                  max={limits[side]}
                  unitLabel={sizingLabels[unit]}
                  disabled={disabled}
                  showLabel={preview?.visible}
                  active={isMarginActive(
                    side,
                    preview?.active ?? null,
                    linkMode,
                  )}
                  onMouseEnter={() => {
                    if (!disabled) {
                      preview?.hover(side);
                    }
                  }}
                  onMouseLeave={() => {
                    preview?.hover('ruler');
                  }}
                  onFocus={() => {
                    preview?.focus(side);
                  }}
                  onBlur={() => {
                    preview?.focus(null);
                  }}
                  onPointerDown={(event) => {
                    if (event.button !== 0 || disabled) return;
                    event.preventDefault();
                    event.currentTarget.focus({ preventScroll: true });
                    event.currentTarget.setPointerCapture(event.pointerId);
                    drag.current = {
                      side,
                      start: horizontal ? event.clientX : event.clientY,
                      margins: { ...margins },
                      scale,
                    };
                    preview?.drag(side);
                  }}
                  onPointerMove={(event) => {
                    const current = drag.current;
                    if (!current || current.side !== side) return;
                    const delta =
                      (horizontal ? event.clientX : event.clientY) -
                      current.start;
                    onChange(
                      moveMargin(
                        current.margins,
                        side,
                        delta,
                        current.scale,
                        unit,
                        dimensions,
                        linkMode,
                      ),
                    );
                  }}
                  onPointerUp={() => finish()}
                  onPointerCancel={() => finish(true)}
                  onLostPointerCapture={() => finish()}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      event.preventDefault();
                      finish(true);
                      event.currentTarget.blur();
                      return;
                    }
                    if (drag.current) return;
                    const negative = horizontal ? 'ArrowLeft' : 'ArrowUp';
                    const positive = horizontal ? 'ArrowRight' : 'ArrowDown';
                    if (event.key !== negative && event.key !== positive)
                      return;
                    event.preventDefault();
                    const step =
                      (unit === 'px' ? 1 : 0.1) * (event.shiftKey ? 10 : 1);
                    onChange(
                      moveMargin(
                        margins,
                        side,
                        (event.key === positive ? 1 : -1) *
                          step *
                          scale *
                          factor,
                        scale,
                        unit,
                        dimensions,
                        linkMode,
                      ),
                    );
                  }}
                />
              ))}
          </Ruler>
        );
      })}
      {preview?.visible && (
        <MarginGuides
          width={width}
          height={height}
          positions={positions}
          active={preview.active}
          linkMode={linkMode}
        />
      )}
    </div>
  );
}
