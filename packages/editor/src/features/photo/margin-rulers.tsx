import { rulerThickness } from '@/components/ui/ruler-metrics';
import { Ruler } from '@/components/ui/ruler';
import { MarginHandle } from '@/components/ui/margin-handle';
import { MarginGuides } from '@/components/ui/margin-guides';
import { useLayoutEffect, useEffect, useRef } from 'react';
import type { ImageDimensions } from '../../../../core/src/document';
import {
  marginSides,
  marginLimits,
  moveMargin,
  pixelsPerUnit,
  sizingLabels,
  type Margins,
  type MarginLinkMode,
  type SizingUnit,
} from '../../../../core/src/sizing';
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
  viewport,
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
  viewport?: { x: number; y: number; width: number; height: number };
  onChange: (margins: Margins) => void;
}) {
  const preview = useMarginPreview();
  const drag = useRef<{
    side: keyof Margins;
    start: number;
    margins: Margins;
    scale: number;
  } | null>(null);
  const captured = useRef<{ element: HTMLElement; id: number } | null>(null);
  const finish = (cancel = false) => {
    if (!drag.current) return;
    if (cancel) onChange(drag.current.margins);
    drag.current = null;
    preview?.drag(null);
    const pointer = captured.current;
    captured.current = null;
    if (pointer?.element.hasPointerCapture(pointer.id))
      pointer.element.releasePointerCapture(pointer.id);
  };
  const finishRef = useRef(finish);
  useLayoutEffect(() => {
    finishRef.current = finish;
  });
  useLayoutEffect(() => {
    finishRef.current();
    const pointer = captured.current;
    if (pointer?.element.hasPointerCapture(pointer.id))
      pointer.element.releasePointerCapture(pointer.id);
    captured.current = null;
  }, [
    x,
    y,
    scale,
    dimensions.width,
    dimensions.height,
    disabled,
    viewport?.width,
    viewport?.height,
  ]);
  useEffect(() => {
    const blur = () => finishRef.current();
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('blur', blur);
      finishRef.current();
    };
  }, []);
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
  const left = Math.max(x, viewport?.x ?? x);
  const top = Math.max(y, viewport?.y ?? y);
  const visibleWidth = Math.max(
    0,
    Math.min(x + width, viewport ? viewport.x + viewport.width : x + width) -
      left,
  );
  const visibleHeight = Math.max(
    0,
    Math.min(y + height, viewport ? viewport.y + viewport.height : y + height) -
      top,
  );
  const offsetX = left - x;
  const offsetY = top - y;
  const visiblePositions = {
    left: positions.left - offsetX,
    right: positions.right - offsetX,
    top: positions.top - offsetY,
    bottom: positions.bottom - offsetY,
  };
  return (
    <div
      className="pointer-events-none absolute"
      style={{ left, top, width: visibleWidth, height: visibleHeight }}
    >
      <span
        aria-hidden="true"
        className={`absolute flex items-center justify-center bg-sidebar-base text-[9px] text-content-secondary ${preview?.visible ? 'opacity-100' : 'opacity-60'}`}
        style={{
          left: -rulerThickness,
          top: -rulerThickness,
          width: rulerThickness,
          height: rulerThickness,
        }}
      >
        {sizingLabels[unit]}
      </span>
      {(['horizontal', 'vertical'] as const).map((axis) => {
        const horizontal = axis === 'horizontal';
        const length = horizontal ? visibleWidth : visibleHeight;
        const offset = horizontal ? offsetX : offsetY;
        return (
          <Ruler
            key={axis}
            orientation={axis}
            length={length}
            startUnit={offset / (factor * scale)}
            pixelsPerUnit={factor * scale}
            unitLabel={sizingLabels[unit]}
            active={preview?.visible}
            className="absolute"
            style={
              horizontal
                ? { left: 0, top: -rulerThickness }
                : { left: -rulerThickness, top: 0 }
            }
            onMouseEnter={() => preview?.hover('ruler')}
            onMouseLeave={() => preview?.hover(null)}
          >
            {marginSides
              .filter((side) =>
                horizontal
                  ? side === 'left' || side === 'right'
                  : side === 'top' || side === 'bottom',
              )
              .filter(
                (side) =>
                  visiblePositions[side] >= 0 &&
                  visiblePositions[side] <= length,
              )
              .map((side) => (
                <MarginHandle
                  key={side}
                  side={side}
                  position={visiblePositions[side]}
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
                    captured.current = {
                      element: event.currentTarget,
                      id: event.pointerId,
                    };
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
          width={visibleWidth}
          height={visibleHeight}
          positions={visiblePositions}
          active={preview.active}
          linkMode={linkMode}
        />
      )}
    </div>
  );
}
