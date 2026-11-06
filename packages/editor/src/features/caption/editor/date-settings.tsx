import { useState } from 'react';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  dateFormats,
  formatCaptureDate,
  validDateFormat,
} from '../../../../../core/src/date-format';

/** Per-occurrence formatting for capture-date tokens, with validated custom patterns. */
export function DateSettings({
  format,
  date,
  hasPhoto,
  onChange,
}: {
  format: string;
  date: string;
  hasPhoto: boolean;
  onChange: (format: string) => void;
}) {
  const [custom, setCustom] = useState(
    !dateFormats.some((value) => value === format),
  );
  const [draft, setDraft] = useState(format);
  const valid = validDateFormat(draft);
  const preview = formatCaptureDate(
    date || '2026-11-06 15:00',
    custom ? draft : format,
  );
  return (
    <div className="space-y-3">
      <Field label="Date format">
        {(id) => (
          <Select
            id={id}
            value={custom ? 'custom' : format}
            options={[
              ...dateFormats.map((value) => ({
                value,
                label: value,
              })),
              { value: 'custom', label: 'Custom' },
            ]}
            onValueChange={(value) => {
              setCustom(value === 'custom');
              if (value !== 'custom') onChange(value);
            }}
          />
        )}
      </Field>
      {custom && (
        <>
          <Field
            label="Custom date format"
            hint="YYYY or YY · MM or M · DD or D · HH:mm (24h). Separators: space . / - _ : and apostrophe."
            error={
              valid
                ? undefined
                : 'Include year, month and day once, using the supported symbols.'
            }
          >
            {(id, descriptionId) => (
              <Input
                id={id}
                aria-describedby={descriptionId}
                aria-invalid={!valid}
                maxLength={64}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && valid) {
                    event.preventDefault();
                    onChange(draft);
                  }
                }}
              />
            )}
          </Field>
          <Button
            variant="outline"
            size="sm"
            disabled={!valid}
            onClick={() => onChange(draft)}
          >
            Apply format
          </Button>
        </>
      )}
      <p className="text-xs text-content-secondary" aria-live="polite">
        {hasPhoto && !date ? 'No capture date in this photo. ' : ''}
        {date ? 'Preview: ' : 'Example: '}
        {preview || (date ? 'Capture time unavailable' : '—')}
      </p>
    </div>
  );
}
