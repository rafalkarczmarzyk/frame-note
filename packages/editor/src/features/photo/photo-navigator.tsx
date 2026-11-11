import { useId, useRef, useLayoutEffect, useEffect } from 'react';
import { ShipWheel } from 'lucide-react';
import { SidebarSection } from '@/components/layout/sidebar-section';
import { Button } from '@/components/ui/button';
import { InlineInputGroup } from '@/components/ui/inline-input-group';
import { PhotoZoomField, PhotoZoomSlider } from './photo-zoom-slider';
import {
  constrainView,
  visiblePhoto,
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
  const thumbScale = Math.min(260 / photo.width, 160 / photo.height);
  const area = visiblePhoto(view, photo, viewport);
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
            <PhotoZoomField
              label="Zoom percentage"
              className="flex-[1.5]"
              scale={view.scale}
              photo={photo}
              viewport={viewport}
              fit={mode === 'fit'}
              disabled={disabled}
              onZoom={onZoom}
            />
          </InlineInputGroup>
          <PhotoZoomSlider
            scale={view.scale}
            photo={photo}
            viewport={viewport}
            disabled={disabled}
            onZoom={onZoom}
          />
        </div>
      </SidebarSection>
    </div>
  );
}
