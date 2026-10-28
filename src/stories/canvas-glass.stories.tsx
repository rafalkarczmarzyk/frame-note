import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { NumberField } from '@/components/ui/number-field';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { SidebarSection } from '@/components/layout/sidebar-section';
import { ColorControls } from '@/features/caption/color-controls';
import { ColorPickerPanel } from '@/features/caption/color-picker-panel';
import { resolvedColor } from '@/features/caption/resolve-color';
import {
  renderGlassPrototype,
  encodeGlassPrototype,
  type GlassPanelPrototype,
} from '@/features/caption/glass-canvas-prototype';
import wildlife from '../../tests/fixtures/20260520-IMG_3843.jpg';
import bright from '../../tests/fixtures/Agata-104.jpg';

function CanvasGlass({
  edge = false,
  initialOverlap = false,
}: {
  edge?: boolean;
  initialOverlap?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [photo, setPhoto] = useState<'wildlife' | 'bright'>('wildlife');
  const [full, setFull] = useState(false);
  const [overlap, setOverlap] = useState(initialOverlap);
  const [color, setColor] = useState('charcoal');
  const [opacity, setOpacity] = useState(25);
  const [blur, setBlur] = useState(0.8);
  const [radius, setRadius] = useState(0.8);
  const [padding, setPadding] = useState(1.5);
  const [palette, setPalette] = useState(false);
  const [output, setOutput] = useState<{
    url: string;
    width: number;
    height: number;
    renderMs: number;
    encodeMs: number;
    bytes: number;
  } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const [revision, setRevision] = useState(0);
  const update = <T,>(setter: (value: T) => void, value: T) => {
    setBusy(true);
    setter(value);
  };
  useEffect(() => {
    let cancelled = false;
    let canvas: HTMLCanvasElement | undefined;
    let url: string | undefined;
    const run = async () => {
      try {
        const image = new Image();
        image.src = photo === 'wildlife' ? wildlife : bright;
        await image.decode();
        await document.fonts.load('20px "Montserrat Variable"');
        if (cancelled) return;
        const factor = full ? 1 : Math.min(1, 1200 / image.naturalWidth);
        const dimensions = {
          width: Math.round(image.naturalWidth * factor),
          height: Math.round(image.naturalHeight * factor),
        };
        const unit = Math.min(dimensions.width, dimensions.height) / 100;
        const fontSize = 2.3 * unit;
        const textX = dimensions.width * (edge ? 0.005 : 0.06);
        const textY = dimensions.height * (edge ? 0.005 : 0.68);
        const lines = [
          'Rafal Karczmarzyk',
          'Wildlife · Canon EOS R5',
          '1/1600 s   f/8   ISO 800',
        ];
        const measure = document.createElement('canvas').getContext('2d')!;
        measure.font = `${fontSize}px "Montserrat Variable"`;
        const contentWidth = Math.max(
          ...lines.map((line) => measure.measureText(line).width),
        );
        const first: GlassPanelPrototype = {
          x: textX - padding * unit,
          y: textY - padding * unit,
          width: contentWidth + 2 * padding * unit,
          height: lines.length * fontSize * 1.5 + 2 * padding * unit,
          radius: radius * unit,
          blur: blur * unit,
          color: resolvedColor(color),
          opacity: opacity / 100,
          text: { x: textX, y: textY, fontSize, lines },
        };
        const panels = [first];
        if (overlap)
          panels.push({
            ...first,
            x: first.x + contentWidth * 0.5,
            y: first.y + fontSize * 2,
            text: {
              ...first.text,
              x: textX + contentWidth * 0.5,
              y: textY + fontSize * 2,
              lines: ['Upper glass layer', 'Samples the layer below'],
            },
          });
        const start = performance.now();
        canvas = renderGlassPrototype(image, dimensions, panels, {
          light: resolvedColor('caption-white'),
          dark: resolvedColor('caption-black'),
          text: resolvedColor('caption-white'),
        });
        const rendered = performance.now();
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.display = 'block';
        canvas.setAttribute('aria-label', 'Canvas glass preview');
        canvas.setAttribute('role', 'img');
        host.current?.replaceChildren(canvas);
        const blob = await encodeGlassPrototype(canvas);
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setOutput({
          url,
          ...dimensions,
          renderMs: rendered - start,
          encodeMs: performance.now() - rendered,
          bytes: blob.size,
        });
        setError('');
      } catch (error) {
        if (!cancelled) {
          setOutput(null);
          setError(
            error instanceof Error ? error.message : 'Rendering failed.',
          );
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    // Coalesce slider events; dispose each full-size result before the next run.
    const timer = window.setTimeout(() => void run(), 100);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (url) URL.revokeObjectURL(url);
      if (canvas) {
        canvas.remove();
        canvas.width = canvas.height = 0;
      }
    };
  }, [
    photo,
    full,
    overlap,
    color,
    opacity,
    blur,
    radius,
    padding,
    edge,
    revision,
  ]);
  return (
    <div className="flex min-h-screen flex-wrap items-start bg-app-base text-content-primary">
      <main className="min-w-0 flex-1 basis-[560px] p-6">
        <h1 className="mb-2 text-sm font-semibold">
          Glass · Canvas & JPG trial
        </h1>
        <p className="mb-4 text-xs text-content-secondary">
          Stage 1 · actual pixel rendering, with sharp text and a raised glass
          surface.
        </p>
        <div ref={host} className="overflow-hidden rounded-lg" />
        <p role="status" className="mt-3 text-xs text-content-secondary">
          {busy
            ? 'Rendering…'
            : output
              ? `${output.width} × ${output.height} · render ${Math.round(output.renderMs)} ms · JPG ${Math.round(output.encodeMs)} ms · ${(output.bytes / 1024 / 1024).toFixed(2)} MB`
              : 'No output'}
        </p>
        {error && (
          <p role="alert" className="mt-3 text-xs">
            {error}
          </p>
        )}
        <div className="mt-4 flex items-center gap-3">
          <Button
            disabled={busy || !output}
            onClick={() => {
              if (!output || busy) return;
              const link = document.createElement('a');
              link.href = output.url;
              link.download = 'framenote-canvas-glass.jpg';
              link.click();
            }}
          >
            Export trial JPG
          </Button>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              setRevision((value) => value + 1);
            }}
          >
            Measure again
          </Button>
        </div>
        <p className="mt-4 text-xs text-content-secondary">
          Preview and export use the same canvas. Padding grows outwards;
          content stays in place. Full photo resolution lets you assess export
          cost.
        </p>
        {output && !busy && (
          <details className="mt-4 text-xs">
            <summary className="cursor-pointer">Compare encoded JPG</summary>
            <img
              className="mt-3 w-full"
              src={output.url}
              alt="Encoded glass JPG"
            />
          </details>
        )}
        {palette && (
          <div className="mt-4 max-w-96">
            <ColorPickerPanel
              value={color}
              onChange={(value) => update(setColor, value)}
              onClose={() => setPalette(false)}
              surface="solid"
            />
          </div>
        )}
      </main>
      <aside className="w-96 max-w-full bg-sidebar-base py-1">
        <SidebarSection id="canvas-glass-controls" title="Canvas glass">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => update(setPhoto, 'wildlife')}
              >
                Wildlife photo
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => update(setPhoto, 'bright')}
              >
                Bright photo
              </Button>
            </div>
            <Switch
              label="Full photo resolution"
              checked={full}
              onCheckedChange={(value) => update(setFull, value)}
            />
            <Switch
              label="Overlapping glass layers"
              checked={overlap}
              onCheckedChange={(value) => update(setOverlap, value)}
            />
            <p className="text-xs text-content-secondary">Base color</p>
            <ColorControls
              value={color}
              onChange={(value) => update(setColor, value)}
              onBrowse={() => setPalette((open) => !open)}
            />
            <NumberField
              label="Base opacity"
              value={opacity}
              onValueChange={(value) => update(setOpacity, value)}
              min={0}
              max={100}
              unit="%"
            />
            <NumberField
              label="Glass blur"
              value={blur}
              onValueChange={(value) => update(setBlur, value)}
              min={0}
              max={3}
              step={0.1}
              unit="% S"
            />
            <Slider
              label="Glass blur"
              value={blur}
              onValueChange={(value) => update(setBlur, value)}
              min={0}
              max={3}
              step={0.1}
            />
            <NumberField
              label="Padding"
              value={padding}
              onValueChange={(value) => update(setPadding, value)}
              min={0}
              max={5}
              step={0.1}
              unit="% S"
            />
            <NumberField
              label="Corner radius"
              value={radius}
              onValueChange={(value) => update(setRadius, value)}
              min={0}
              max={5}
              step={0.1}
              unit="% S"
            />
            <p className="text-xs text-content-muted">
              This trial uses a shared padding value. The final inspector will
              use the four-sided padding editor. Material gradients approximate
              the CSS reference; CSS saturation is not yet included.
            </p>
          </div>
        </SidebarSection>
      </aside>
    </div>
  );
}
const meta = {
  title: 'Screens/LayerBackground/CanvasTrial',
  component: CanvasGlass,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CanvasGlass>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Glass: Story = {};
export const Overlap: Story = { args: { initialOverlap: true } };
export const PhotoEdge: Story = { args: { edge: true } };
