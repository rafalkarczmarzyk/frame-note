import { Badge } from '@/components/ui/badge';
import { ElementSizeSettings } from './element-size-settings';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Camera, Image, Replace, Tag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';

type Kind = 'tag' | 'icon' | 'svg' | 'png';
type Status = 'value' | 'empty' | 'absent';
type Alignment = 'top' | 'center' | 'bottom';
const names: Record<Kind, string> = {
  tag: 'author',
  icon: 'camera',
  svg: 'Signature.svg',
  png: 'Watermark.png',
};
const types: Record<Kind, string> = {
  tag: 'Metadata',
  icon: 'Icon',
  svg: 'SVG',
  png: 'PNG',
};

// Isolated design proposal: real document integration follows user review.

function Proposal({
  kind = 'icon',
  status = 'value',
  width = 340,
}: {
  kind?: Kind;
  status?: Status;
  width?: number;
}) {
  const [height, setHeight] = useState(1.5);
  const [unit, setUnit] = useState<'font' | 'document'>('font');
  const [alignment, setAlignment] = useState<Alignment>('center');
  const [color, setColor] = useState<'original' | 'single'>('original');
  const [removed, setRemoved] = useState(false);
  const fontPixels = 24;
  const pixels = unit === 'font' ? height * fontPixels : height;
  const Icon = kind === 'tag' ? Tag : kind === 'icon' ? Camera : Image;
  const name = names[kind];
  const changeUnit = (next: typeof unit) => {
    setHeight(next === 'font' ? pixels / fontPixels : pixels);
    setUnit(next);
  };
  return (
    <section
      style={{ width }}
      className="max-w-full space-y-3 rounded-xl bg-sidebar-base p-3 text-content-primary"
      aria-label={`${types[kind]} settings proposal`}
    >
      <p className="text-xs text-content-secondary">Content</p>
      <div
        role="group"
        aria-label="Content preview"
        className="control-field flex min-h-28 flex-wrap content-start items-center gap-2 p-3 text-sm"
      >
        <span>©</span>
        {!removed && (
          <Badge
            asChild
            tone="neutral"
            size="token"
            className="min-h-9 gap-2 outline-2 outline-input-focus-ring"
          >
            <button
              type="button"
              aria-label={`Select ${name}`}
              aria-pressed="true"
            >
              <Icon aria-hidden="true" className="size-5" />
              <span className="text-xs">{name}</span>
            </button>
          </Badge>
        )}
        <span>Photo</span>
      </div>
      {removed ? (
        <div className="space-y-3 py-2">
          <p role="status" className="text-xs text-content-secondary">
            Element removed.
          </p>
          <Button variant="outline" size="sm" onClick={() => setRemoved(false)}>
            Restore element
          </Button>
        </div>
      ) : (
        <div
          aria-label="Selected element settings"
          className="space-y-3 rounded-lg border border-container-settings-border bg-selected-element-base p-3"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Icon
              aria-hidden="true"
              className="size-4 shrink-0 text-content-secondary"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-content-secondary">{types[kind]}</p>
              <p className="truncate text-sm font-medium">{name}</p>
            </div>
          </div>
          {kind === 'tag' ? (
            <div className="space-y-1">
              <p className="text-xs text-content-secondary">Value</p>
              <p
                role="status"
                className={`rounded border border-border-subtle p-2 text-sm ${status === 'empty' ? 'text-notice-warning' : status === 'absent' ? 'text-notice-error' : ''}`}
              >
                {status === 'value'
                  ? 'Rafał Karczmarzyk'
                  : status === 'empty'
                    ? 'No value returned for this photo.'
                    : 'Tag not found in this photo.'}
              </p>
            </div>
          ) : (
            <>
              <ElementSizeSettings
                height={height}
                unit={unit}
                onHeight={setHeight}
                onUnit={changeUnit}
                alignment={alignment}
                onAlignment={setAlignment}
              />
              <div className="space-y-1.5">
                <p className="text-xs text-content-secondary">Line preview</p>
                <div
                  className="control-field flex min-h-20 justify-center gap-2 overflow-auto p-3"
                  style={{ alignItems: 'center' }}
                >
                  <div
                    className="flex gap-2"
                    style={{
                      fontSize: fontPixels,
                      lineHeight: 1.4,
                      alignItems:
                        alignment === 'top'
                          ? 'flex-start'
                          : alignment === 'bottom'
                            ? 'flex-end'
                            : 'center',
                    }}
                  >
                    <span>Photo</span>
                    {kind === 'icon' ? (
                      <Camera
                        aria-label="Camera preview"
                        className="shrink-0"
                        style={{
                          height: Math.max(1, Math.min(pixels, 120)),
                          width: Math.max(1, Math.min(pixels, 120)),
                        }}
                      />
                    ) : (
                      <span
                        role="img"
                        aria-label={`${types[kind]} placeholder`}
                        className="inline-flex shrink-0 items-center justify-center rounded border border-content-secondary bg-panel-base text-xs"
                        style={{
                          height: Math.max(1, Math.min(pixels, 120)),
                          width: Math.max(1, Math.min(pixels, 120)) * 1.5,
                        }}
                      >
                        {types[kind]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {kind === 'svg' && (
                <SegmentedControl
                  label="SVG colors"
                  value={color}
                  onValueChange={setColor}
                  options={[
                    { value: 'original', label: 'Original colors' },
                    { value: 'single', label: 'Layer color' },
                  ]}
                />
              )}
              {kind === 'icon' && (
                <p className="text-xs text-content-secondary">
                  Uses the layer’s color and opacity.
                </p>
              )}
              {kind === 'png' && pixels > 48 && (
                <p role="status" className="text-xs text-notice-warning">
                  Larger than the source image; exported edges may look soft.
                </p>
              )}
              {(kind === 'svg' || kind === 'png') && (
                <Button variant="outline" size="sm" className="w-full" disabled>
                  <Replace aria-hidden="true" />
                  Replace graphic
                </Button>
              )}
            </>
          )}
          <div className="border-t border-border-subtle pt-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setRemoved(true)}
            >
              <Trash2 aria-hidden="true" />
              Remove
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

const meta = {
  title: 'Proposals/SelectedElementSettings',
  component: Proposal,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Interactive proposal only. Shared selection panel for metadata, icons, SVG and PNG. Size controls and alignment use the same layout; unit changes preserve height at a sample 24 px font. The line preview is schematic, the preview is capped at 120 px, replacement is illustrative and disabled and no production document is changed.',
      },
    },
  },
} satisfies Meta<typeof Proposal>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Metadata: Story = { args: { kind: 'tag' } };
export const EmptyMetadata: Story = { args: { kind: 'tag', status: 'empty' } };
export const UnknownMetadata: Story = {
  args: { kind: 'tag', status: 'absent' },
};
export const Icon: Story = { args: { kind: 'icon' } };
export const SVG: Story = { args: { kind: 'svg' } };
export const PNG: Story = { args: { kind: 'png' } };
export const Narrow: Story = { args: { kind: 'icon', width: 290 } };
export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      {(['tag', 'icon', 'svg', 'png'] as const).map((kind) => (
        <Proposal key={kind} kind={kind} />
      ))}
    </div>
  ),
};
