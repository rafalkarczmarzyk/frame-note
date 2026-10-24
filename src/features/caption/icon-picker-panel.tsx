import { builtinIcons } from './builtin-icons';
import { useState } from 'react';
import { FloatingPanel } from '@/components/layout/floating-panel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PickerList } from '@/components/ui/picker-list';
import { svgIcon, svgUrl, loadIcon, type SvgIcon } from './svg-icons';

export function IconPickerPanel({
  icons,
  onUpload,
  onChoose,
  onClose,
  className,
}: {
  icons: readonly SvgIcon[];
  onUpload: (icon: SvgIcon) => void;
  onChoose: (name: string) => void;
  onClose: () => void;
  className?: string;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <FloatingPanel
      title="Inline icons"
      description="Choose a built-in icon or upload your SVG. Icons inherit the caption size and color."
      onClose={onClose}
      surface="solid"
      className={className}
      toolbar={
        <label className="flex flex-col gap-2 text-xs">
          Icon name
          <Input
            aria-label="Icon name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="aperture"
          />
        </label>
      }
      footer={
        <label className="flex flex-col gap-2 text-xs">
          Upload SVG
          <input
            type="file"
            accept=".svg,image/svg+xml"
            aria-label="Upload SVG icon"
            disabled={busy}
            onChange={async (event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = '';
              if (!file) return;
              setError('');
              setBusy(true);
              try {
                if (file.size > 256_000)
                  throw Error('SVG must be smaller than 256 KB.');
                const key =
                  name.trim() ||
                  file.name
                    .replace(/\.svg$/iu, '')
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/gu, '-');
                if (icons.some((icon) => icon.name === key))
                  throw Error(
                    'This icon name is already used. Choose another name.',
                  );
                const icon = svgIcon(key, await file.text());
                await loadIcon(icon);
                onUpload(icon);
                setName('');
              } catch (cause) {
                setError(
                  cause instanceof Error
                    ? cause.message
                    : 'Could not load SVG.',
                );
              } finally {
                setBusy(false);
              }
            }}
          />
          {busy && <span role="status">Loading SVG…</span>}
          {error && <span role="alert">{error}</span>}
        </label>
      }
    >
      {['Built-in', 'Your SVGs'].map((group) => {
        const items = icons.filter(
          (icon) =>
            builtinIcons.some((builtin) => builtin.name === icon.name) ===
            (group === 'Built-in'),
        );
        return (
          <section key={group} aria-label={group} className="mb-4">
            <h3 className="px-3 py-2 text-xs text-label">{group}</h3>
            <PickerList
              items={items.map((icon) => ({
                id: icon.name,
                label: icon.name,
                description: `{icon:${icon.name}}`,
                leading: (
                  <span
                    aria-hidden="true"
                    className="inline-block size-5 shrink-0 bg-current"
                    style={{
                      maskImage: `url("${svgUrl(icon.svg)}")`,
                      maskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                    }}
                  />
                ),
              }))}
              onChoose={onChoose}
              emptyText="Upload your first SVG icon."
            />
          </section>
        );
      })}
      <Button
        variant="outline"
        size="sm"
        className="mt-3 w-full"
        onClick={onClose}
      >
        Back to caption
      </Button>
    </FloatingPanel>
  );
}
