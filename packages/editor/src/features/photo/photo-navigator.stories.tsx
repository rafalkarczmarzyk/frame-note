import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PhotoNavigator, type PhotoNavigatorProps } from './photo-navigator';
import {
  constrainView,
  fitScale,
  roundManualScale,
  zoomView,
  type Size,
  type View,
} from './navigator-geometry';
import { Ruler } from '@/components/ui/ruler';
import landscape from '../../../../../tests/fixtures/20260520-IMG_3843.jpg';
import portrait from '../../../../../tests/fixtures/20261021-IMG_0469.jpg';

type Props = {
  shape: 'landscape' | 'portrait' | 'panorama' | 'small';
  status: PhotoNavigatorProps['status'];
  collapsed: boolean;
};
function Demo({ shape, status, collapsed }: Props) {
  const photo = useMemo(
    () =>
      ({
        landscape: { width: 2400, height: 1600 },
        portrait: { width: 1600, height: 2400 },
        panorama: { width: 4800, height: 1200 },
        small: { width: 240, height: 160 },
      })[shape],
    [shape],
  );
  const preview = shape === 'portrait' ? portrait : landscape;
  const host = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<Size>({ width: 600, height: 460 });
  const [view, setView] = useState<View>({ scale: 1, x: 0, y: 0 });
  const [mode, setMode] = useState<'fit' | 'manual'>('fit');
  const space = useRef(false);
  const overviewStart = useRef<View | null>(null);
  const drag = useRef<{ x: number; y: number; view: View } | null>(null);
  useLayoutEffect(() => {
    const node = host.current!;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const next = {
        width: entry.contentRect.width - 56,
        height: entry.contentRect.height - 56,
      };
      setViewport(next);
      setView((old) =>
        mode === 'fit'
          ? constrainView(
              { scale: fitScale(photo, next), x: 0, y: 0 },
              photo,
              next,
            )
          : constrainView(old, photo, next),
      );
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [photo, mode]);
  const zoom = (scale: number | 'fit') => {
    setMode(scale === 'fit' ? 'fit' : 'manual');
    setView((old) =>
      zoomView(
        old,
        scale === 'fit'
          ? fitScale(photo, viewport)
          : roundManualScale(scale, photo, viewport),
        photo,
        viewport,
      ),
    );
  };
  const pan = (x: number, y: number) =>
    setView((old) => constrainView({ ...old, x, y }, photo, viewport));
  const left = 28 + view.x;
  const top = 28 + view.y;
  const right = Math.min(viewport.width + 28, left + photo.width * view.scale);
  const bottom = Math.min(
    viewport.height + 28,
    top + photo.height * view.scale,
  );
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-lg font-semibold">
          Navigator · interaction playground
        </h1>
        <p className="mt-2 text-xs text-content-secondary">
          Fit / 100% / numeric zoom · logarithmic zoom · drag the overview to
          navigate. Space + drag or middle mouse pans the photo. Rulers follow
          each photo edge, then pin to the viewport.
        </p>
      </div>
      <div className="grid min-h-[560px] grid-cols-1 overflow-hidden rounded-xl border border-panel-border lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="bg-sidebar-base">
          <PhotoNavigator
            photo={photo}
            viewport={viewport}
            view={view}
            preview={preview}
            mode={mode}
            status={status}
            defaultOpen={!collapsed}
            onZoom={zoom}
            onPan={pan}
            onPanStart={() => {
              overviewStart.current = view;
            }}
            onPanCancel={() => {
              if (overviewStart.current) setView(overviewStart.current);
            }}
          />
        </aside>
        <div
          ref={host}
          tabIndex={0}
          role="region"
          aria-label="Photo navigation prototype"
          className="relative min-h-[480px] cursor-grab active:cursor-grabbing touch-none overflow-hidden bg-workspace-base outline-none"
          onKeyDown={(event) => {
            if (event.code === 'Space') {
              event.preventDefault();
              space.current = true;
            }
            if (event.key === 'Escape' && drag.current) {
              setView(drag.current.view);
              drag.current = null;
            }
          }}
          onKeyUp={(event) => {
            if (event.code === 'Space') space.current = false;
          }}
          onBlur={() => {
            space.current = false;
            drag.current = null;
          }}
          onPointerDown={(event) => {
            event.currentTarget.focus({ preventScroll: true });
            if (
              status !== 'ready' ||
              !(event.button === 1 || (event.button === 0 && space.current))
            )
              return;
            event.preventDefault();
            drag.current = { x: event.clientX, y: event.clientY, view };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (drag.current)
              pan(
                drag.current.view.x + event.clientX - drag.current.x,
                drag.current.view.y + event.clientY - drag.current.y,
              );
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            if (drag.current) setView(drag.current.view);
            drag.current = null;
          }}
        >
          {status === 'ready' && (
            <>
              <div
                className="absolute overflow-hidden"
                style={{
                  left: 28,
                  top: 28,
                  width: viewport.width,
                  height: viewport.height,
                }}
              >
                <img
                  src={preview}
                  alt="Navigation test photo"
                  draggable={false}
                  className="pointer-events-none absolute max-w-none select-none"
                  style={{
                    left: view.x,
                    top: view.y,
                    width: photo.width * view.scale,
                    height: photo.height * view.scale,
                    objectFit: 'cover',
                  }}
                />
              </div>
              <Ruler
                orientation="horizontal"
                active
                unitLabel="px"
                length={Math.max(0, right - Math.max(28, left))}
                pixelsPerUnit={view.scale}
                startUnit={Math.max(0, -view.x / view.scale)}
                style={{
                  position: 'absolute',
                  left: Math.max(28, left),
                  top: Math.max(10, top - 18),
                }}
              />
              <Ruler
                orientation="vertical"
                active
                unitLabel="px"
                length={Math.max(0, bottom - Math.max(28, top))}
                pixelsPerUnit={view.scale}
                startUnit={Math.max(0, -view.y / view.scale)}
                style={{
                  position: 'absolute',
                  left: Math.max(10, left - 18),
                  top: Math.max(28, top),
                }}
              />
            </>
          )}
        </div>
      </div>
      <p className="text-xs text-content-muted">
        Lightweight demonstrator. 100% = one image pixel per CSS pixel (also on
        Retina). Panorama is a cropped fixture; small photo uses a reduced
        fixture. Z, wheel/pinch, layer/margin editing and per-photo view memory
        are available in the application and Screens/TestPhotos.
      </p>
    </div>
  );
}
const meta = {
  title: 'Photo session/Photo Navigator',
  component: Demo,
  args: { shape: 'landscape', status: 'ready', collapsed: false },
  argTypes: {
    shape: {
      control: 'select',
      options: ['landscape', 'portrait', 'panorama', 'small'],
    },
    status: { control: 'select', options: ['ready', 'empty', 'busy', 'error'] },
  },
  render: (args) => <Demo key={JSON.stringify(args)} {...args} />,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Navigator: controlled Navigator panel and lightweight photo/ruler demonstrator. The application integrates this same Navigator with PhotoWorkspace.',
      },
    },
  },
} satisfies Meta<typeof Demo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Portrait: Story = { args: { shape: 'portrait' } };
export const Panorama: Story = { args: { shape: 'panorama' } };
export const SmallPhoto: Story = { args: { shape: 'small' } };
export const Collapsed: Story = { args: { collapsed: true } };
export const Empty: Story = { args: { status: 'empty' } };
export const Busy: Story = { args: { status: 'busy' } };
export const Error: Story = { args: { status: 'error' } };
