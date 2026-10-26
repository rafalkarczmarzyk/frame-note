import { Field } from './field';
import { NumberInput } from './number-input';
import { DimensionInput } from './dimension-input';

export function NumberField({
  label,
  title,
  value,
  onValueChange,
  min,
  max,
  step = 0.01,
  disabled = false,
  hint,
  unit,
  hideLabel = false,
}: {
  label: string;
  title?: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step?: number | 'any';
  disabled?: boolean;
  hint?: string;
  unit?: string;
  hideLabel?: boolean;
}) {
  return (
    <Field label={label} hint={hint} hideLabel={hideLabel}>
      {(id, descriptionId) => {
        const props = {
          id,
          title,
          'aria-describedby': descriptionId,
          value,
          onValueChange,
          min,
          max,
          step,
          disabled,
          stepperLabel: label,
        };
        return unit ? (
          <DimensionInput {...props} unit={unit} />
        ) : (
          <NumberInput {...props} />
        );
      }}
    </Field>
  );
}
