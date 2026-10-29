import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Layers, Type } from 'lucide-react';
import { InspectorSection } from '@/components/layout/inspector-section';
import { SidebarSection } from '@/components/layout/sidebar-section';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { MarginEditor } from '@/components/ui/margin-editor';
import { NumberField } from '@/components/ui/number-field';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ColorControls } from '@/features/caption/color-controls';
import { ColorPickerPanel } from '@/features/caption/color-picker-panel';
import { resolvedColor } from '@/features/caption/resolve-color';
import photo from '../../tests/fixtures/20260520-IMG_3843.jpg';

type Background = 'none' | 'color' | 'glass';

/** UI proposal only. CSS glass illustrates the material, not the JPG renderer. */
function BackgroundProposal({
  initialMode = 'color',
}: {
  initialMode?: Background;
}) {
  const [mode, setMode] = useState<Background>(initialMode);
  const [color, setColor] = useState(
    initialMode === 'glass' ? 'charcoal' : 'caption-black',
  );
  const [opacity, setOpacity] = useState(initialMode === 'glass' ? 25 : 45);
  const [shadow, setShadow] = useState(false);
  const [shadowColor, setShadowColor] = useState('caption-black');
  const [shadowSpread, setShadowSpread] = useState(0);
  const [shadowOpacity, setShadowOpacity] = useState(35);
  const [shadowBlur, setShadowBlur] = useState(1);
  const [shadowX, setShadowX] = useState(0);
  const [shadowY, setShadowY] = useState(0.5);
  const [blur, setBlur] = useState(0.8);
  const [radius, setRadius] = useState(0.8);
  const [padding, setPadding] = useState({
    top: 1.5,
    right: 2,
    bottom: 1.5,
    left: 2,
  });
  const [link, setLink] = useState<'all' | 'pairs' | 'none'>('pairs');
  const [text, setText] = useState(
    'Rafal Karczmarzyk\nWildlife · Canon EOS R5\n1/1600 s   f/8   ISO 800',
  );
  const [palette, setPalette] = useState<'background' | 'shadow' | null>(null);
  // The landscape's short edge is 2/3 of its width. Container units scale the mockup.
  const dimension = (value: number) => `${(value * 2) / 3}cqw`;
  return (
    <div className="min-h-screen bg-app-base text-content-primary">
      <div className="flex items-center justify-between gap-4 border-b border-panel-border px-6 py-4">
        <div>
          <h1 className="text-sm font-semibold">Layer background</h1>
          <p className="mt-1 text-xs text-content-secondary">
            Interface proposal · live material preview
          </p>
        </div>
        <span className="text-xs text-content-muted">Sizing: % short edge</span>
      </div>
      <div className="flex flex-wrap items-start">
        <main className="min-w-0 flex-1 basis-[560px] p-6">
          <div
            className="relative overflow-hidden rounded-lg"
            style={{ containerType: 'inline-size' }}
          >
            <img
              src={photo}
              alt="Wildlife photograph by Rafal Karczmarzyk"
              className="block h-auto w-full"
            />
            <div
              className="absolute bottom-[4.5%] left-[3%] max-w-[94%]"
              style={{
                bottom: '4.5%',
                left: '3%',
                maxWidth: '94%',
                padding:
                  mode === 'none'
                    ? 0
                    : `${dimension(padding.top)} ${dimension(padding.right)} ${dimension(padding.bottom)} ${dimension(padding.left)}`,
                borderRadius: mode === 'none' ? 0 : dimension(radius),
                boxShadow:
                  mode === 'glass'
                    ? 'var(--background-concept-glass-shadow)'
                    : undefined,
              }}
            >
              {mode === 'color' && shadow && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    borderRadius: 'inherit',
                    opacity: shadowOpacity / 100,
                    boxShadow: `${dimension(shadowX)} ${dimension(shadowY)} ${dimension(shadowBlur)} ${dimension(shadowSpread)} ${resolvedColor(shadowColor)}`,
                  }}
                />
              )}
              {mode !== 'none' && (
                <>
                  <div
                    className="absolute inset-0"
                    style={{
                      borderRadius: 'inherit',
                      backdropFilter:
                        mode === 'glass'
                          ? `blur(${dimension(blur)}) saturate(160%)`
                          : undefined,
                      WebkitBackdropFilter:
                        mode === 'glass'
                          ? `blur(${dimension(blur)}) saturate(160%)`
                          : undefined,
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      borderRadius: 'inherit',
                      background: resolvedColor(color),
                      opacity: opacity / 100,
                    }}
                  />
                  {mode === 'glass' && (
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        borderRadius: 'inherit',
                        background:
                          'var(--background-concept-glass-reflection)',
                        boxShadow: 'var(--background-concept-glass-bevel)',
                      }}
                    />
                  )}
                </>
              )}
              <div
                className="relative whitespace-pre-wrap text-caption-white"
                style={{ fontSize: dimension(2.3), lineHeight: 1.5 }}
              >
                {text || 'Sample text'}
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-content-secondary">
            Selected layer · the frame includes padding. Text stays fully
            opaque.
          </p>
          <p className="mt-2 text-xs text-content-muted">
            Glass is a visual prototype here. JPG rendering will be verified
            separately.
          </p>
          {palette && (
            <div className="mt-4 max-w-96">
              <ColorPickerPanel
                value={palette === 'shadow' ? shadowColor : color}
                onChange={palette === 'shadow' ? setShadowColor : setColor}
                onClose={() => setPalette(null)}
                surface="solid"
              />
            </div>
          )}
        </main>
        <aside
          aria-label="Selected layer proposal"
          className="w-96 max-w-full shrink-0 bg-sidebar-base py-1"
        >
          <SidebarSection
            id="background-proposal-layer"
            title="Layers"
            icon={<Layers />}
            iconTone="caption"
          >
            <div className="control-segments p-1">
              <div className="control-segment control-selected flex items-center gap-2 px-3 py-2 text-xs">
                <Type className="size-4" />
                Rafal Karczmarzyk · Wildlife
              </div>
            </div>
            <div className="mt-3 rounded-lg border border-container-settings-border bg-container-settings-base">
              <InspectorSection title="Content">
                <Textarea
                  aria-label="Layer content"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  rows={3}
                />
              </InspectorSection>
              <InspectorSection title="Background">
                <div className="space-y-4">
                  <SegmentedControl
                    label="Background type"
                    value={mode}
                    onValueChange={setMode}
                    options={[
                      {
                        value: 'none',
                        label: 'None',
                        tooltip: 'Show content without a background.',
                      },
                      {
                        value: 'color',
                        label: 'Color',
                        tooltip: 'Add a color behind the whole content block.',
                      },
                      {
                        value: 'glass',
                        label: 'Glass',
                        tooltip:
                          'Blur beneath the layer and add a translucent tint.',
                      },
                    ]}
                  />
                  {mode !== 'none' && (
                    <>
                      <div className="space-y-2">
                        <p className="text-xs text-content-secondary">
                          {mode === 'glass' ? 'Base color' : 'Color'}
                        </p>
                        <ColorControls
                          value={color}
                          onChange={setColor}
                          onBrowse={() =>
                            setPalette((open) =>
                              open === 'background' ? null : 'background',
                            )
                          }
                        />
                      </div>
                      {mode === 'glass' && (
                        <p className="text-xs text-content-secondary">
                          Choose the glass base color. Opacity controls its
                          coverage; highlights and shading stay visible.
                        </p>
                      )}
                      <div
                        className="grid items-end gap-3"
                        style={{ gridTemplateColumns: '1fr 104px' }}
                      >
                        <div className="pb-3">
                          <Slider
                            label="Background opacity"
                            value={opacity}
                            onValueChange={setOpacity}
                          />
                        </div>
                        <NumberField
                          label="Opacity"
                          value={opacity}
                          onValueChange={setOpacity}
                          min={0}
                          max={100}
                          unit="%"
                        />
                      </div>
                      {mode === 'glass' && (
                        <div
                          className="grid items-end gap-3"
                          style={{ gridTemplateColumns: '1fr 104px' }}
                        >
                          <div className="pb-3">
                            <Slider
                              label="Glass blur"
                              value={blur}
                              onValueChange={setBlur}
                              min={0}
                              max={5}
                              step={0.1}
                            />
                          </div>
                          <NumberField
                            label="Blur"
                            tooltip="Softens what is behind the background. Text remains sharp."
                            value={blur}
                            onValueChange={setBlur}
                            min={0}
                            max={5}
                            step={0.1}
                            unit="%"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <p className="text-xs text-content-secondary">
                          Padding
                        </p>
                        <MarginEditor
                          purpose="padding"
                          appearance="compact"
                          value={padding}
                          linkMode={link}
                          unit="short-edge"
                          unitLabel="% S"
                          dimensions={{ width: 1200, height: 800 }}
                          onChange={(value, mode) => {
                            setPadding(value);
                            setLink(mode);
                          }}
                        />
                      </div>
                      <NumberField
                        label="Corner radius"
                        value={radius}
                        onValueChange={setRadius}
                        min={0}
                        max={10}
                        step={0.1}
                        unit="%"
                      />
                      {mode === 'color' && (
                        <div className="space-y-3">
                          <Switch
                            label="Drop shadow"
                            checked={shadow}
                            onCheckedChange={setShadow}
                          />
                          {shadow && (
                            <>
                              <div
                                className="space-y-2"
                                role="group"
                                aria-label="Shadow color"
                              >
                                <p className="text-xs text-content-secondary">
                                  Shadow color
                                </p>
                                <ColorControls
                                  value={shadowColor}
                                  onChange={setShadowColor}
                                  onBrowse={() =>
                                    setPalette((open) =>
                                      open === 'shadow' ? null : 'shadow',
                                    )
                                  }
                                />
                              </div>
                              <div
                                className="grid items-end gap-3"
                                style={{ gridTemplateColumns: '1fr 104px' }}
                              >
                                <div className="pb-3">
                                  <Slider
                                    label="Shadow opacity"
                                    value={shadowOpacity}
                                    onValueChange={setShadowOpacity}
                                  />
                                </div>
                                <NumberField
                                  label="Shadow opacity"
                                  value={shadowOpacity}
                                  onValueChange={setShadowOpacity}
                                  min={0}
                                  max={100}
                                  unit="%"
                                />
                              </div>
                              <NumberField
                                label="Shadow blur"
                                value={shadowBlur}
                                onValueChange={setShadowBlur}
                                min={0}
                                max={5}
                                step={0.1}
                                unit="%"
                              />
                              <NumberField
                                label="Spread"
                                tooltip="Expands or contracts the shadow before blurring."
                                value={shadowSpread}
                                onValueChange={setShadowSpread}
                                min={-5}
                                max={5}
                                step={0.1}
                                unit="%"
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <NumberField
                                  label="Offset X"
                                  value={shadowX}
                                  onValueChange={setShadowX}
                                  min={-5}
                                  max={5}
                                  step={0.1}
                                  unit="%"
                                />
                                <NumberField
                                  label="Offset Y"
                                  value={shadowY}
                                  onValueChange={setShadowY}
                                  min={-5}
                                  max={5}
                                  step={0.1}
                                  unit="%"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-content-muted">
                        Padding, radius{mode === 'glass' ? ' and blur' : ''} use
                        the document unit: % short edge.
                      </p>
                    </>
                  )}
                </div>
              </InspectorSection>
              <InspectorSection title="Position">
                <p className="text-xs text-content-secondary">
                  Bottom left · margins apply to the outer background edge.
                </p>
              </InspectorSection>
            </div>
          </SidebarSection>
        </aside>
      </div>
    </div>
  );
}
const meta = {
  title: 'Proposals/LayerBackground',
  component: BackgroundProposal,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof BackgroundProposal>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Color: Story = { args: { initialMode: 'color' } };
export const Glass: Story = { args: { initialMode: 'glass' } };
export const None: Story = { args: { initialMode: 'none' } };
