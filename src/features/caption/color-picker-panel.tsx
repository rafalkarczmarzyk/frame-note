import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';
import { FloatingPanel } from '@/components/layout/floating-panel';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { PickerList } from '@/components/ui/picker-list';
import { ColorSwatch } from '@/components/ui/color-swatch';
import {
  captionColors,
  normalizeHex,
  resolveCaptionColor,
} from '@/domain/caption-colors';

export function ColorPickerPanel({
  value,
  onChange,
  onClose,
  className,
  surface = 'glass',
}: {
  value: string;
  onChange: (color: string) => void;
  onClose: () => void;
  className?: string;
  surface?: 'glass' | 'solid';
}) {
  const resolve = (color: string) =>
    resolveCaptionColor(color, (name) =>
      getComputedStyle(document.documentElement).getPropertyValue(
        `--color-${name}`,
      ),
    );
  const [draftState, setDraftState] = useState(() => ({
    value,
    text: resolve(value),
  }));
  const draft = draftState.value === value ? draftState.text : resolve(value);
  const setDraft = (text: string) => setDraftState({ value, text });
  const [error, setError] = useState('');
  const choose = (color: string) => {
    onChange(color);
    setDraft(
      resolveCaptionColor(color, (name) =>
        getComputedStyle(document.documentElement).getPropertyValue(
          `--color-${name}`,
        ),
      ),
    );
    setError('');
  };
  return (
    <FloatingPanel
      title="Choose a color"
      description="Neutrals and soft tones for your caption."
      onClose={onClose}
      className={className}
      surface={surface}
    >
      <section aria-label="Visual color picker" className="mb-4">
        <HexColorPicker
          color={
            normalizeHex(draft) ??
            resolveCaptionColor(value, (token) =>
              getComputedStyle(document.documentElement).getPropertyValue(
                `--color-${token}`,
              ),
            )
          }
          onChange={(hex) => choose(normalizeHex(hex)!)}
          style={{ width: '100%', height: 160 }}
        />
        <div className="mt-4">
          <Field
            label="Custom color (HEX)"
            hint="Use 3 or 6 digits, with or without #."
            error={error}
          >
            {(id, descriptionId) => (
              <div className="flex items-center gap-2">
                <ColorSwatch value={normalizeHex(draft) ?? value} />
                <Input
                  id={id}
                  aria-describedby={descriptionId}
                  aria-invalid={!!error}
                  value={draft}
                  onChange={(event) => {
                    const text = event.target.value;
                    const hex = normalizeHex(text);
                    setDraftState({ value: hex ?? value, text });
                    if (hex) onChange(hex);
                    setError('');
                  }}
                  onBlur={() => {
                    const hex = normalizeHex(draft);
                    if (hex) choose(hex);
                    else
                      setError('Enter a valid HEX color using 3 or 6 digits.');
                  }}
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
            )}
          </Field>
        </div>
      </section>
      {(['Neutrals', 'Soft colors'] as const).map((group) => {
        const items = captionColors.filter((color) => color.group === group);
        return (
          items.length > 0 && (
            <section key={group} className="mb-4">
              <h3 className="px-3 py-2 text-xs text-label">{group}</h3>
              <PickerList
                items={items.map((color) => ({
                  id: color.value,
                  label: color.label,
                  selected:
                    color.value === value ||
                    resolveCaptionColor(color.value, (name) =>
                      getComputedStyle(
                        document.documentElement,
                      ).getPropertyValue(`--color-${name}`),
                    ).toUpperCase() === value.toUpperCase(),
                  leading: (
                    <ColorSwatch value={color.value} className="size-6" />
                  ),
                }))}
                onChoose={choose}
              />
            </section>
          )
        );
      })}
    </FloatingPanel>
  );
}
