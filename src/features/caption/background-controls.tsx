import { useState } from 'react';
import type { Caption, ImageDimensions } from '@/domain/document';
import {
  createLayerBackground,
  mapBackgroundLengths,
} from '@/domain/layer-background';
import { pixelsPerUnit, sizingLabels } from '@/domain/sizing';
import { InspectorSection } from '@/components/layout/inspector-section';
import { MarginEditor } from '@/components/ui/margin-editor';
import { NumberField } from '@/components/ui/number-field';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ColorControls } from './color-controls';
import { ColorPickerPanel } from './color-picker-panel';

export function BackgroundControls({
  caption,
  dimensions,
  onChange,
  disabled = false,
  glassEnabled = false,
}: {
  caption: Caption;
  dimensions: ImageDimensions;
  onChange: (caption: Caption) => void;
  disabled?: boolean;
  glassEnabled?: boolean;
}) {
  const [palette, setPalette] = useState<'base' | 'shadow' | null>(null);
  const b =
    caption.background ??
    mapBackgroundLengths(
      createLayerBackground(),
      (value) =>
        (value * pixelsPerUnit('short-edge', dimensions)) /
        pixelsPerUnit(caption.sizingUnit, dimensions),
    );
  const change = (patch: Partial<typeof b>) =>
    onChange({ ...caption, background: { ...b, ...patch } });
  const shadow = (patch: Partial<typeof b.shadow>) =>
    change({ shadow: { ...b.shadow, ...patch } });
  const unit = sizingLabels[caption.sizingUnit];
  const max =
    Math.max(dimensions.width, dimensions.height) /
    pixelsPerUnit(caption.sizingUnit, dimensions);
  const step = caption.sizingUnit === 'px' ? 1 : 0.1;
  return (
    <InspectorSection title="Background">
      <fieldset disabled={disabled} className="min-w-0 space-y-3">
        <SegmentedControl
          label="Background type"
          value={b.type}
          disabled={disabled}
          onValueChange={(type) => {
            setPalette(null);
            change({ type });
          }}
          options={[
            {
              value: 'none',
              label: 'None',
              tooltip: 'Content only. Retains background settings.',
            },
            { value: 'color', label: 'Color' },
            ...(glassEnabled
              ? [{ value: 'glass' as const, label: 'Glass' }]
              : []),
          ]}
        />
        {b.type !== 'none' && (
          <>
            <div
              role="group"
              aria-label="Background color"
              className="space-y-2"
            >
              <p className="text-xs text-content-secondary">
                {b.type === 'glass' ? 'Base color' : 'Color'}
              </p>
              <ColorControls
                disabled={disabled}
                value={b.color}
                onChange={(color) => change({ color })}
                onBrowse={() => setPalette(palette === 'base' ? null : 'base')}
              />
            </div>
            <div
              className="grid items-end gap-3"
              style={{ gridTemplateColumns: '1fr 104px' }}
            >
              <div className="pb-3">
                <Slider
                  disabled={disabled}
                  label="Background opacity"
                  value={b.opacity * 100}
                  onValueChange={(value) => change({ opacity: value / 100 })}
                />
              </div>
              <NumberField
                label="Background opacity"
                hideLabel
                value={b.opacity * 100}
                onValueChange={(value) => change({ opacity: value / 100 })}
                min={0}
                max={100}
                unit="%"
                disabled={disabled}
              />
            </div>
            {b.type === 'glass' && (
              <>
                <NumberField
                  label="Glass blur"
                  value={b.blur}
                  onValueChange={(blur) => change({ blur })}
                  min={0}
                  max={max * 0.05}
                  step={step}
                  unit={unit}
                  disabled={disabled}
                />
                <Slider
                  label="Glass blur"
                  value={b.blur}
                  onValueChange={(blur) => change({ blur })}
                  min={0}
                  max={max * 0.05}
                  step={step}
                  disabled={disabled}
                />
              </>
            )}
            {palette === 'base' && (
              <ColorPickerPanel
                value={b.color}
                onChange={(color) => change({ color })}
                onClose={() => setPalette(null)}
                surface="solid"
              />
            )}
            <p className="text-xs text-content-secondary">Padding</p>
            <MarginEditor
              purpose="padding"
              appearance="compact"
              value={b.padding}
              linkMode={b.paddingLinkMode}
              unit={caption.sizingUnit}
              unitLabel={unit}
              dimensions={dimensions}
              disabled={disabled}
              onChange={(padding, paddingLinkMode) =>
                change({ padding, paddingLinkMode })
              }
            />
            <NumberField
              label="Corner radius"
              value={b.radius}
              onValueChange={(radius) => change({ radius })}
              min={0}
              max={max}
              step={step}
              unit={unit}
              disabled={disabled}
            />
            {b.type === 'color' && (
              <>
                <Switch
                  label="Drop shadow"
                  checked={b.shadow.enabled}
                  onCheckedChange={(enabled) => shadow({ enabled })}
                  disabled={disabled}
                />
                {b.shadow.enabled && (
                  <div
                    className="space-y-3"
                    role="group"
                    aria-label="Drop shadow settings"
                  >
                    <div className="space-y-2">
                      <p className="text-xs text-content-secondary">
                        Shadow color
                      </p>
                      <ColorControls
                        disabled={disabled}
                        value={b.shadow.color}
                        onChange={(color) => shadow({ color })}
                        onBrowse={() =>
                          setPalette(palette === 'shadow' ? null : 'shadow')
                        }
                      />
                    </div>
                    {palette === 'shadow' && (
                      <ColorPickerPanel
                        value={b.shadow.color}
                        onChange={(color) => shadow({ color })}
                        onClose={() => setPalette(null)}
                        surface="solid"
                      />
                    )}
                    <NumberField
                      label="Shadow opacity"
                      value={b.shadow.opacity * 100}
                      onValueChange={(value) =>
                        shadow({ opacity: value / 100 })
                      }
                      min={0}
                      max={100}
                      unit="%"
                      disabled={disabled}
                    />
                    <NumberField
                      label="Shadow blur"
                      value={b.shadow.blur}
                      onValueChange={(blur) => shadow({ blur })}
                      min={0}
                      max={max * 0.1}
                      step={step}
                      unit={unit}
                      disabled={disabled}
                    />
                    <NumberField
                      label="Spread"
                      value={b.shadow.spread}
                      onValueChange={(spread) => shadow({ spread })}
                      min={-max}
                      max={max}
                      step={step}
                      unit={unit}
                      disabled={disabled}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <NumberField
                        label="Shadow X"
                        value={b.shadow.x}
                        onValueChange={(x) => shadow({ x })}
                        min={-max}
                        max={max}
                        step={step}
                        unit={unit}
                        disabled={disabled}
                      />
                      <NumberField
                        label="Shadow Y"
                        value={b.shadow.y}
                        onValueChange={(y) => shadow({ y })}
                        min={-max}
                        max={max}
                        step={step}
                        unit={unit}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </fieldset>
    </InspectorSection>
  );
}
