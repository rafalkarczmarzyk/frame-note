import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';
import { createCaption } from '../../../core/src/document';
import {
  createColorLayerBackground,
  createGlassLayerBackground,
} from '../../../core/src/layer-background';
import { defaultTiledPosition } from '../../../core/src/tiled-watermark';
import { renderPhotoComposition } from '@/features/caption/render';
import type { BlendMode } from '../../../core/src/layer-blending';
import { resolvedColor } from '@/features/caption/resolve-color';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Select } from '@/components/ui/select';
import { RangeField } from '@/components/ui/range-field';
import { Switch } from '@/components/ui/switch';
import { SidebarSection } from '@/components/layout/sidebar-section';
import bright from '../../../../tests/fixtures/Agata-104.jpg';
import dark from '../../../../tests/fixtures/20210228-IMG_3200.jpg';

const modes = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'add', label: 'Add' },
];
function BlendingTrial() {
  const [mode, setMode] = useState<BlendMode>('normal');
  const [opacity, setOpacity] = useState(100);
  const [photo, setPhoto] = useState(bright);
  const [background, setBackground] = useState('color');
  const [tiled, setTiled] = useState(false);
  const [full, setFull] = useState(false);
  const [lower, setLower] = useState(true);
  const [output, setOutput] = useState<{
    png: string;
    jpg: string;
    ms: number;
    width: number;
    height: number;
  }>();
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const urls: string[] = [];
    let canvas: HTMLCanvasElement | undefined;
    const timer = setTimeout(() => {
      void (async () => {
        setBusy(true);
        const image = new Image();
        image.src = photo;
        await image.decode();
        if (!active) return;
        const scale = full ? 1 : Math.min(1, 1200 / image.naturalWidth);
        const dimensions = {
          width: Math.round(image.naturalWidth * scale),
          height: Math.round(image.naturalHeight * scale),
        };
        const caption = createCaption();
        caption.template = 'FrameNote · Leave your mark';
        caption.blending = { mode, opacity: opacity / 100 };
        caption.style.fontSize = tiled ? 3 : 6;
        caption.style.opacity = 0.7;
        caption.position.anchor = 'center';
        caption.background =
          background === 'glass'
            ? createGlassLayerBackground()
            : background === 'color'
              ? createColorLayerBackground()
              : undefined;
        if (tiled)
          caption.position.tiled = { ...defaultTiledPosition(), spacing: 2 };
        const below = createCaption();
        below.template = 'Lower layer';
        below.style.fontSize = 10;
        below.style.opacity = 0.6;
        below.position.anchor = 'center';
        below.visible = lower;
        const start = performance.now();
        canvas = await renderPhotoComposition(image, dimensions, [
          {
            caption: below,
            text: below.template,
            color: resolvedColor('caption-white'),
          },
          {
            caption,
            text: caption.template,
            color: resolvedColor('caption-white'),
          },
        ]);
        const ms = performance.now() - start;
        for (const type of ['image/png', 'image/jpeg']) {
          const blob = await new Promise<Blob>((resolve, reject) =>
            canvas!.toBlob(
              (value) =>
                value ? resolve(value) : reject(Error('Encoding failed')),
              type,
              0.95,
            ),
          );
          urls.push(URL.createObjectURL(blob));
        }
        canvas.width = canvas.height = 0;
        if (!active) {
          urls.forEach(URL.revokeObjectURL);
          return;
        }
        setOutput({ png: urls[0]!, jpg: urls[1]!, ms, ...dimensions });
        setError('');
      })()
        .catch((cause: unknown) => {
          if (active)
            setError(
              cause instanceof Error ? cause.message : 'Rendering failed',
            );
        })
        .finally(() => {
          if (active) setBusy(false);
        });
    }, 80);
    return () => {
      active = false;
      clearTimeout(timer);
      urls.forEach(URL.revokeObjectURL);
      if (canvas) canvas.width = canvas.height = 0;
    };
  }, [mode, opacity, photo, background, tiled, full, lower]);
  return (
    <div className="flex min-h-screen flex-wrap bg-app-base text-content-primary">
      <main className="min-w-0 flex-1 basis-[560px] space-y-4 p-6">
        <h1>Layer blending · rendering trial</h1>
        <p className="text-xs text-content-secondary">
          Stage 2 proposal. Entire layer including all Tiled copies is blended
          once. Text opacity: 70%. Lower layer stays Normal.
        </p>
        {output && (
          <img src={output.png} alt="Blending preview" className="w-full" />
        )}
        <p role="status">
          {busy
            ? 'Rendering…'
            : output
              ? `${output.width} × ${output.height} · render ${Math.round(output.ms)} ms`
              : 'No output'}
        </p>
        {error && <p role="alert">{error}</p>}
        <div className="flex gap-2">
          {(['png', 'jpg'] as const).map((format) => (
            <Button
              key={format}
              disabled={busy || !output}
              onClick={() => {
                if (!output) return;
                const link = document.createElement('a');
                link.href = output[format];
                link.download = `blending-trial.${format}`;
                link.click();
              }}
            >
              Export {format.toUpperCase()}
            </Button>
          ))}
        </div>
        {output && (
          <details>
            <summary>Compare encoded JPG</summary>
            <img
              src={output.jpg}
              alt="Encoded blending JPG"
              className="w-full"
            />
          </details>
        )}
      </main>
      <aside className="w-96 bg-sidebar-base">
        <SidebarSection id="blending-trial" title="Blending">
          <div className="space-y-4">
            <Field label="Blend mode">
              {(id) => (
                <Select
                  id={id}
                  value={mode}
                  options={modes}
                  onValueChange={(value) => setMode(value as BlendMode)}
                />
              )}
            </Field>
            <RangeField
              label="Layer opacity"
              value={opacity}
              onValueChange={setOpacity}
              icon={<Layers size={16} />}
              tooltip="Opacity of the complete layer"
              unit="%"
            />
            <Field label="Photo">
              {(id) => (
                <Select
                  id={id}
                  value={photo}
                  onValueChange={setPhoto}
                  options={[
                    { value: bright, label: 'Bright' },
                    { value: dark, label: 'Dark' },
                  ]}
                />
              )}
            </Field>
            <Field label="Background">
              {(id) => (
                <Select
                  id={id}
                  value={background}
                  onValueChange={setBackground}
                  options={['none', 'color', 'glass'].map((value) => ({
                    value,
                    label: value,
                  }))}
                />
              )}
            </Field>
            <Switch
              label="Dense Tiled"
              checked={tiled}
              onCheckedChange={setTiled}
            />
            <Switch
              label="Visible lower layer"
              checked={lower}
              onCheckedChange={setLower}
            />
            <Switch
              label="Full photo resolution"
              checked={full}
              onCheckedChange={setFull}
            />
          </div>
        </SidebarSection>
      </aside>
    </div>
  );
}
const meta = {
  title: 'Proposals/LayerBlendingTrial',
  component: BlendingTrial,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof BlendingTrial>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Rendering: Story = {};
