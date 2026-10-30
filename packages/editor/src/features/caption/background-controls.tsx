import { useState } from 'react';
import type { Caption, ImageDimensions } from '../../../../core/src/document';
import {
  createColorLayerBackground,
  createGlassLayerBackground,
  createLayerBackground,
  mapBackgroundLengths,
} from '../../../../core/src/layer-background';
import { pixelsPerUnit, sizingLabels } from '../../../../core/src/sizing';
import { InspectorSection } from '@/components/layout/inspector-section';
import { MarginEditor } from '@/components/ui/margin-editor';
import { NumberField } from '@/components/ui/number-field';
import { RangeField } from '@/components/ui/range-field';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Switch } from '@/components/ui/switch';
import { ColorControls } from './color-controls';
import { ColorPickerPanel } from './color-picker-panel';
import { Aperture, Blend, SquareRoundCorner } from 'lucide-react';

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
            if ((type === 'glass' || type === 'color') && !caption.background) {
              onChange({
                ...caption,
                background: mapBackgroundLengths(
                  type === 'glass'
                    ? createGlassLayerBackground()
                    : createColorLayerBackground(),
                  (value) =>
                    (value * pixelsPerUnit('short-edge', dimensions)) /
                    pixelsPerUnit(caption.sizingUnit, dimensions),
                ),
              });
            } else change({ type });
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
            <RangeField
              label="Opacity"
              inputLabel="Background opacity"
              icon={<Blend className="size-4" aria-hidden="true" />}
              tooltip="Background opacity · controls the tint strength"
              value={b.opacity * 100}
              onValueChange={(value) => change({ opacity: value / 100 })}
              unit="%"
              disabled={disabled}
            />
            {b.type === 'glass' && (
              <RangeField
                label="Glass blur"
                icon={<Aperture className="size-4" aria-hidden="true" />}
                tooltip="Glass blur · lens-style backdrop blur"
                value={b.blur}
                onValueChange={(blur) => change({ blur })}
                min={0}
                max={max * 0.05}
                step={step}
                unit={unit}
                disabled={disabled}
              />
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
            <RangeField
              label="Corner radius"
              icon={<SquareRoundCorner className="size-4" aria-hidden="true" />}
              tooltip="Corner radius"
              value={b.radius}
              onValueChange={(radius) => change({ radius })}
              min={0}
              max={Math.min(max, 10)}
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
