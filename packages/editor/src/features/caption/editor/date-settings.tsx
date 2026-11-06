import { useState } from 'react';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  dateFormats,
  dateFormatLabel,
  type DateLocale,
  formatCaptureDate,
  validDateFormat,
} from '../../../../../core/src/date-format';

/** Per-occurrence formatting for capture-date tokens, with validated custom patterns. */
export function DateSettings({
  format,
  locale,
  timeOnly = false,
  date,
  hasPhoto,
  onChange,
}: {
  format: string;
  locale?: DateLocale;
  timeOnly?: boolean;
  date: string;
  hasPhoto: boolean;
  onChange: (format: string, locale?: DateLocale) => void;
}) {
  const formats: readonly string[] = timeOnly
    ? ['HH:mm', 'h:mm A', 'hh:mm A']
    : dateFormats;
  const selectedFormat = formats.find(
    (value) => dateFormatLabel(value) === dateFormatLabel(format),
  );
  const [custom, setCustom] = useState(!selectedFormat);
  const [draft, setDraft] = useState(format);
  const valid =
    validDateFormat(draft, timeOnly) &&
    (timeOnly || !/HH|hh|h|mm|A/.test(draft));
  const preview = dateFormatLabel(
    formatCaptureDate(
      date || '2026-11-06 15:00',
      custom ? draft : format,
      locale,
      timeOnly,
    ),
  );
  return (
    <div className="space-y-3">
      <Field label={timeOnly ? 'Time format' : 'Date format'}>
        {(id) => (
          <Select
            id={id}
            value={custom ? 'custom' : (selectedFormat ?? format)}
            options={[
              ...formats.map((value) => ({
                value,
                label: timeOnly
                  ? ({
                      'HH:mm': '24-hour · 15:05',
                      'h:mm A': '12-hour · 3:05 PM',
                      'hh:mm A': '12-hour · 03:05 PM',
                    }[value] ?? value)
                  : dateFormatLabel(value),
              })),
              { value: 'custom', label: 'Custom' },
            ]}
            onValueChange={(value) => {
              setCustom(value === 'custom');
              if (value !== 'custom') onChange(value, locale);
            }}
          />
        )}
      </Field>
      {!timeOnly && (
        <Field
          label="Date language"
          hint="Saved with this token; independent of your system language."
        >
          {(id) => (
            <Select
              id={id}
              value={locale ?? 'en'}
              options={[
                { value: 'en', label: 'English' },
                { value: 'pl', label: 'Polski' },
              ]}
              onValueChange={(value) =>
                onChange(format, value === 'pl' ? 'pl' : undefined)
              }
            />
          )}
        </Field>
      )}
      {custom && (
        <>
          <Field
            label={timeOnly ? 'Custom time format' : 'Custom date format'}
            hint={
              timeOnly
                ? 'HH:mm (24h) / h:mm A or hh:mm A (12h).'
                : 'YYYY / YY · MMMM / MMM / MM / M · DD / D. Separators: space . / - _ : and apostrophe.'
            }
            error={
              valid
                ? undefined
                : timeOnly
                  ? 'Include hours and minutes once; use A with 12-hour time.'
                  : 'Include year, month and day once. Add time using a separate time token.'
            }
          >
            {(id, descriptionId) => (
              <Input
                id={id}
                aria-describedby={descriptionId}
                aria-invalid={!valid}
                maxLength={64}
                style={{ fontFamily: '"Montserrat Variable", "7-Segment"' }}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && valid) {
                    event.preventDefault();
                    onChange(draft, locale);
                  }
                }}
              />
            )}
          </Field>
          <Button
            variant="outline"
            size="sm"
            disabled={!valid}
            onClick={() => onChange(draft, locale)}
          >
            Apply format
          </Button>
        </>
      )}
      <p className="text-xs text-content-secondary" aria-live="polite">
        {hasPhoto && !date
          ? timeOnly
            ? 'No capture time in this photo. '
            : 'No capture date in this photo. '
          : ''}
        {date ? 'Preview: ' : 'Example: '}
        {preview || (date ? 'Capture time unavailable' : '—')}
      </p>
    </div>
  );
}
