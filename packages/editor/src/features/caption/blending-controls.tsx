import { Blend } from 'lucide-react';
import type { Caption } from '../../../../core/src/document';
import {
  createLayerBlending,
  type BlendMode,
} from '../../../../core/src/layer-blending';
import { InspectorSection } from '@/components/layout/inspector-section';
import { Select } from '@/components/ui/select';
import { Field } from '@/components/ui/field';
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
        <Field label="Blend mode">
          {(id) => (
            <Select
              id={id}
              value={blending.mode}
              disabled={disabled}
              onValueChange={(mode) =>
                onChange({
                  ...caption,
                  blending: { ...blending, mode: mode as BlendMode },
                })
              }
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'multiply', label: 'Multiply' },
                { value: 'screen', label: 'Screen' },
                { value: 'soft-light', label: 'Soft Light' },
                { value: 'add', label: 'Add' },
              ]}
            />
          )}
        </Field>
        <RangeField
          label="Layer opacity"
          icon={<Blend className="size-4" aria-hidden="true" />}
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
