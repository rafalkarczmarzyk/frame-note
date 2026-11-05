import { Layers, X, Sun, Eclipse, Plus } from 'lucide-react';
import type { Caption } from '../../../../core/src/document';
import {
  createLayerBlending,
  type BlendMode,
} from '../../../../core/src/layer-blending';
import { InspectorSection } from '@/components/layout/inspector-section';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { InlineInputGroup } from '@/components/ui/inline-input-group';
import { RangeField } from '@/components/ui/range-field';

export function BlendingControls({
  caption,
  onChange,
  disabled,
}: {
  caption: Caption;
  onChange: (caption: Caption) => void;
  disabled: boolean;
}) {
  const blending = caption.blending ?? createLayerBlending();
  return (
    <InspectorSection title="Blending">
      <div className="space-y-2">
        <p className="text-xs text-content-secondary">
          Blend mode ·{' '}
          {blending.mode === 'soft-light'
            ? 'Soft Light'
            : blending.mode[0]!.toUpperCase() + blending.mode.slice(1)}
        </p>
        <InlineInputGroup label="Layer blending mode">
          <SegmentedControl<BlendMode>
            className="w-full"
            label="Blend mode"
            value={blending.mode}
            disabled={disabled}
            onValueChange={(mode) =>
              onChange({ ...caption, blending: { ...blending, mode } })
            }
            options={[
              {
                value: 'normal',
                label: 'Normal',
                tooltip: 'Normal · preserve layer colors',
                content: <Layers aria-hidden="true" />,
              },
              {
                value: 'multiply',
                label: 'Multiply',
                tooltip: 'Multiply · darken the photo',
                content: <X aria-hidden="true" />,
              },
              {
                value: 'screen',
                label: 'Screen',
                tooltip: 'Screen · lighten the photo',
                content: <Sun aria-hidden="true" />,
              },
              {
                value: 'soft-light',
                label: 'Soft Light',
                tooltip: 'Soft Light · subtle light and shade',
                content: <Eclipse aria-hidden="true" />,
              },
              {
                value: 'add',
                label: 'Add',
                tooltip: 'Add · brighten by adding color',
                content: <Plus aria-hidden="true" />,
              },
            ]}
          />
        </InlineInputGroup>
        <RangeField
          label="Layer opacity"
          icon={<Layers className="size-4" aria-hidden="true" />}
          tooltip="Opacity of the complete layer, including its background"
          value={Math.round(blending.opacity * 100)}
          unit="%"
          disabled={disabled}
          onValueChange={(value) =>
            onChange({
              ...caption,
              blending: { ...blending, opacity: value / 100 },
            })
          }
        />
      </div>
    </InspectorSection>
  );
}
