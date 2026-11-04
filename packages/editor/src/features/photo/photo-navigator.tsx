import { useId, useRef, useLayoutEffect, useEffect } from 'react';
import { ShipWheel, ZoomIn, ZoomOut } from 'lucide-react';
import { SidebarSection } from '@/components/layout/sidebar-section';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { InlineInputGroup } from '@/components/ui/inline-input-group';
import { NumberField } from '@/components/ui/number-field';
import { Slider } from '@/components/ui/slider';
import {
  constrainView,
  minimumScale,
  manualMinimumScale,
  visiblePhoto,
  zoomLevels,
  type Size,
  type View,
} from './navigator-geometry';

export interface PhotoNavigatorProps {
  photo: Size;
  viewport: Size;
  view: View;
  preview: string;
  mode: 'fit' | 'manual';
  status?: 'ready' | 'empty' | 'busy' | 'error';
  defaultOpen?: boolean;
  onZoom: (scale: number | 'fit', manual?: boolean) => void;
  onPan: (x: number, y: number) => void;
  onPanStart?: () => void;
  onPanCancel?: () => void;
}
/** Controlled panel; preview contains the composition, without selection handles. */
export function PhotoNavigator({
  photo,
  viewport,
  view,
  preview,
  mode,
  status = 'ready',
  defaultOpen = true,
  onZoom,
  onPan,
  onPanStart,
  onPanCancel,
}: PhotoNavigatorProps) {
  const id = useId();
  const drag = useRef<{
    x: number;
    y: number;
    startX: number;
    startY: number;
  } | null>(null);
  const captured = useRef<{ element: HTMLElement; pointer: number } | null>(
    null,
  );
  const release = () => {
    drag.current = null;
    const active = captured.current;
    captured.current = null;
    if (active?.element.hasPointerCapture(active.pointer))
      active.element.releasePointerCapture(active.pointer);
  };
  const releaseRef = useRef(release);
  useLayoutEffect(() => {
    releaseRef.current = release;
  });
  useLayoutEffect(() => {
    releaseRef.current();
  }, [photo, viewport, status]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && drag.current) {
        event.preventDefault();
        onPanCancel?.();
        releaseRef.current();
      }
    };
    const blur = () => releaseRef.current();
    window.addEventListener('keydown', key);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', key);
      window.removeEventListener('blur', blur);
    };
  }, [onPanCancel]);
  const disabled = status !== 'ready';
  const minimum = minimumScale(photo, viewport);
  const manualMinimum = manualMinimumScale(photo, viewport);
  const thumbScale = Math.min(260 / photo.width, 160 / photo.height);
  const area = visiblePhoto(view, photo, viewport);
  const levels = [
    ...new Set([
      manualMinimum,
      ...zoomLevels.filter((n) => n >= manualMinimum),
    ]),
  ];
  const step = (direction: number) => {
    const next =
      direction > 0
        ? levels.find((n) => n > view.scale + 1e-8)
        : levels.findLast((n) => n < view.scale - 1e-8);
    if (next !== undefined) onZoom(next, true);
  };
  return (
    <div data-photo-view-controls>
      <SidebarSection
        id={id}
        title="Navigator"
        icon={<ShipWheel />}
        defaultOpen={defaultOpen}
        iconTone="position"
      >
        <div className="space-y-3">
          <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg bg-workspace-base">
            {disabled ? (
              <p
                role="status"
                className="px-3 text-center text-xs text-content-muted"
              >
                {status === 'empty'
                  ? 'Open a photo to navigate'
                  : status === 'busy'
                    ? 'Preparing preview…'
                    : 'Could not load preview'}
              </p>
            ) : (
              <div
                className="relative cursor-grab touch-none active:cursor-grabbing"
                style={{
                  width: photo.width * thumbScale,
                  height: photo.height * thumbScale,
                }}
                onPointerDown={(event) => {
                  if (event.button !== 0) return;
                  onPanStart?.();
                  const rect = event.currentTarget.getBoundingClientRect();
                  const x = (event.clientX - rect.left) / thumbScale;
                  const y = (event.clientY - rect.top) / thumbScale;
                  const inside =
                    x >= area.x &&
                    x <= area.x + area.width &&
                    y >= area.y &&
                    y <= area.y + area.height;
                  const startX = inside
                    ? view.x
                    : viewport.width / 2 - x * view.scale;
                  const startY = inside
                    ? view.y
                    : viewport.height / 2 - y * view.scale;
                  const centered = constrainView(
                    { scale: view.scale, x: startX, y: startY },
                    photo,
                    viewport,
                  );
                  drag.current = {
                    x: event.clientX,
                    y: event.clientY,
                    startX: centered.x,
                    startY: centered.y,
                  };
                  if (!inside) onPan(centered.x, centered.y);
                  captured.current = {
                    element: event.currentTarget,
                    pointer: event.pointerId,
                  };
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={(event) => {
                  if (!drag.current) return;
                  onPan(
                    drag.current.startX -
                      ((event.clientX - drag.current.x) / thumbScale) *
                        view.scale,
                    drag.current.startY -
                      ((event.clientY - drag.current.y) / thumbScale) *
                        view.scale,
                  );
                }}
                onPointerUp={release}
                onPointerCancel={() => {
                  drag.current = null;
                  onPanCancel?.();
                }}
                onLostPointerCapture={() => {
                  drag.current = null;
                }}
              >
                <img
                  src={preview}
                  alt="Composition overview"
                  draggable={false}
                  className="pointer-events-none block h-full w-full select-none object-cover"
                />
                <div
                  className="pointer-events-none absolute border-2 border-content-primary"
                  style={{
                    left: area.x * thumbScale,
                    top: area.y * thumbScale,
                    width: area.width * thumbScale,
                    height: area.height * thumbScale,
                  }}
                />
              </div>
            )}
          </div>
          <InlineInputGroup
            label="Photo zoom controls"
            className="control-segments"
          >
            <Button
              variant="segment"
              className="flex-1"
              disabled={disabled}
              aria-pressed={!disabled && mode === 'fit'}
              onClick={() => onZoom('fit')}
            >
              Fit
            </Button>
            <Button
              variant="segment"
              className="flex-1"
              disabled={disabled}
              aria-pressed={!disabled && Math.abs(view.scale - 1) < 1e-8}
              onClick={() => onZoom(1)}
            >
              100%
            </Button>
            <NumberField
              label="Zoom percentage"
              className="flex-[1.5]"
              hideLabel
              unit="%"
              value={Number((view.scale * 100).toFixed(2))}
              min={
                view.scale < manualMinimum
                  ? Number((view.scale * 100).toFixed(2))
                  : manualMinimum * 100
              }
              max={800}
              step={1}
              disabled={disabled}
              onValueChange={(value) => {
                if (
                  mode === 'fit' &&
                  view.scale < manualMinimum &&
                  value <= Number((view.scale * 100).toFixed(2))
                )
                  return;
                onZoom(value / 100, true);
              }}
            />
          </InlineInputGroup>
          <div className="flex items-center gap-2">
            <IconButton
              label="Zoom out"
              disabled={disabled || view.scale <= manualMinimum + 1e-8}
              onClick={() => step(-1)}
            >
              <ZoomOut className="size-4" />
            </IconButton>
            <Slider
              label="Photo zoom"
              onKeyDown={(event) => {
                const direction = ['ArrowRight', 'ArrowUp', 'PageUp'].includes(
                  event.key,
                )
                  ? 1
                  : ['ArrowLeft', 'ArrowDown', 'PageDown'].includes(event.key)
                    ? -1
                    : 0;
                if (event.key === 'Home' || event.key === 'End' || direction) {
                  event.preventDefault();
                  const step =
                    event.key.startsWith('Page') || event.shiftKey ? 10 : 1;
                  const next =
                    event.key === 'Home'
                      ? manualMinimum
                      : event.key === 'End'
                        ? 8
                        : view.scale + (direction * step) / 100;
                  onZoom(next, true);
                }
              }}
              valueText={`${Number((view.scale * 100).toFixed(2))}%`}
              value={Math.log(view.scale)}
              min={Math.log(minimum)}
              max={Math.log(8)}
              step={0.001}
              disabled={disabled}
              onValueChange={(value) => onZoom(Math.exp(value), true)}
            />
            <IconButton
              label="Zoom in"
              disabled={disabled || view.scale >= 8}
              onClick={() => step(1)}
            >
              <ZoomIn className="size-4" />
            </IconButton>
          </div>
        </div>
      </SidebarSection>
    </div>
  );
}
