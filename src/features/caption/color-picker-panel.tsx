import { useEffect, useRef, useState } from 'react';
import { FloatingPanel } from '@/components/layout/floating-panel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
}: {
  value: string;
  onChange: (color: string) => void;
  onClose: () => void;
  className?: string;
}) {
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState(() =>
    resolveCaptionColor(value, (name) =>
      getComputedStyle(document.documentElement).getPropertyValue(
        `--color-${name}`,
      ),
    ),
  );
  const [error, setError] = useState('');
  const opener = useRef(document.activeElement);
  useEffect(
    () => () => {
      if (opener.current instanceof HTMLElement && opener.current.isConnected)
        opener.current.focus({ preventScroll: true });
    },
    [],
  );
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
  const filtered = captionColors.filter((color) =>
    `${color.label} ${color.group}`
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );
  return (
    <FloatingPanel
      title="Choose a color"
      description="Neutrals and soft tones for your caption."
      onClose={onClose}
      className={className}
      toolbar={
        <Input
          autoFocus
          aria-label="Search colors"
          placeholder="Search colors…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      }
      footer={
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const hex = normalizeHex(draft);
            if (hex) choose(hex);
            else setError('Enter a valid HEX color using 3 or 6 digits.');
          }}
          className="space-y-3"
          aria-label="Custom caption color"
        >
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
                    setDraft(event.target.value);
                    setError('');
                  }}
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
            )}
          </Field>
          <Button type="submit" size="sm" className="w-full">
            Apply color
          </Button>
        </form>
      }
    >
      {filtered.length === 0 && (
        <p className="p-3 text-xs text-content-secondary">
          No matching colors. You can still enter a custom HEX below.
        </p>
      )}
      {(['Neutrals', 'Soft colors'] as const).map((group) => {
        const items = filtered.filter((color) => color.group === group);
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
