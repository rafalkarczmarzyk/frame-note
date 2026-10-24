import { useState } from 'react';
import { Field } from './field';
import { Input } from './input';

export function NumberField({
  label,
  value,
  onValueChange,
  min,
  max,
  step = 0.01,
  disabled = false,
  hint,
}: {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  hint?: string;
}) {
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);
  return (
    <Field label={label} hint={hint}>
      {(id, descriptionId) => (
        <Input
          id={id}
          aria-describedby={descriptionId}
          type="number"
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          value={focused ? draft : String(value)}
          onFocus={() => {
            setDraft(String(value));
            setFocused(true);
          }}
          onBlur={() => setFocused(false)}
          onChange={(event) => {
            setDraft(event.target.value);
            if (event.target.value === '') return;
            const next = event.target.valueAsNumber;
            if (Number.isFinite(next) && next >= min && next <= max)
              onValueChange(next);
          }}
        />
      )}
    </Field>
  );
}
