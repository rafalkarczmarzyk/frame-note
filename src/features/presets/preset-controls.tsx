import { createId } from '@/lib/create-id';
import { Select } from '@/components/ui/select';
import { PickerList } from '@/components/ui/picker-list';
import { builtinPresets } from '@/domain/builtin-presets';
import { useRef, useState } from 'react';
import {
  Bookmark,
  Download,
  Upload,
  Save,
  Copy,
  Trash2,
  Settings2,
  Pencil,
  X,
} from 'lucide-react';
import { SidebarSection } from '@/components/layout/sidebar-section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { createPortal } from 'react-dom';
import { FloatingPanel } from '@/components/layout/floating-panel';
import { IconButton } from '@/components/ui/icon-button';
import type { CaptionLayout } from '@/domain/caption-layout';
import type { SvgAsset } from '@/domain/svg-asset';
import {
  createPreset,
  parsePreset,
  presetStorageKey,
  type LayoutPreset,
} from '@/domain/presets';
import { svgIcon } from '../caption/svg-icons';

export function PresetControls({
  layout,
  icons,
  onApply,
  disabled = false,
  persist = true,
  panelHost,
  onBrowse,
  onClose,
}: {
  layout: CaptionLayout;
  icons: SvgAsset[];
  onApply: (preset: LayoutPreset) => void;
  disabled?: boolean;
  persist?: boolean;
  panelHost: HTMLElement | null;
  onBrowse: () => void;
  onClose: () => void;
}) {
  const importInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [presets, setPresets] = useState<LayoutPreset[]>(() => {
    if (!persist) return [];
    try {
      const stored: unknown = JSON.parse(
        localStorage.getItem(presetStorageKey) ?? '[]',
      );
      return Array.isArray(stored)
        ? stored.map((item) => parsePreset(JSON.stringify(item), svgIcon))
        : [];
    } catch {
      return [];
    }
  });
  const [selected, setSelected] = useState('');
  const [name, setName] = useState('');
  const [naming, setNaming] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const allPresets = [...builtinPresets, ...presets];
  const current = allPresets.find((preset) => preset.id === selected);
  const builtin = builtinPresets.some((preset) => preset.id === selected);
  const dirty =
    current &&
    JSON.stringify(
      createPreset(
        current.id,
        current.name,
        { ...layout, activeId: current.layout.activeId },
        icons,
      ),
    ) !== JSON.stringify(current);
  const startCopy = () => {
    setRenameId(null);
    setName(current ? `${current.name} copy` : '');
    setNaming(true);
    onBrowse();
  };
  const store = (next: LayoutPreset[]) => {
    try {
      if (persist) localStorage.setItem(presetStorageKey, JSON.stringify(next));
      setPresets(next);
      setError('');
      return true;
    } catch {
      setError(
        'Could not save presets. Browser storage may be full or unavailable. Export your preset to keep a copy.',
      );
      return false;
    }
  };
  const save = (replace: boolean) => {
    const title = replace && current ? current.name : name.trim();
    if (!title) {
      setError('Enter a preset name.');
      return;
    }
    const preset = createPreset(
      replace && current && !builtin ? current.id : createId(),
      title,
      layout,
      icons,
    );
    const next =
      replace && current && !builtin
        ? presets.map((item) => (item.id === current.id ? preset : item))
        : [...presets, preset];
    if (store(next)) {
      setSelected(preset.id);
      setNaming(false);
    }
  };
  const apply = (preset: LayoutPreset) => {
    setSelected(preset.id);
    setName(preset.name);
    setNaming(false);
    setError('');
    onApply(structuredClone(preset));
  };
  const form = naming && (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (renameId) {
          if (!name.trim()) {
            setError('Enter a preset name.');
            return;
          }
          if (
            store(
              presets.map((p) =>
                p.id === renameId ? { ...p, name: name.trim() } : p,
              ),
            )
          ) {
            setNaming(false);
            setRenameId(null);
          }
        } else save(false);
      }}
    >
      <Field label="Preset name">
        {(id) => (
          <Input
            id={id}
            value={name}
            maxLength={80}
            autoFocus
            disabled={disabled}
            onChange={(event) => setName(event.target.value)}
          />
        )}
      </Field>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" type="submit" disabled={disabled}>
          <Save />
          Save
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setNaming(false);
            setRenameId(null);
            setError('');
          }}
        >
          <X />
          Cancel
        </Button>
      </div>
    </form>
  );
  return (
    <>
      <SidebarSection
        id="presets"
        title="Presets"
        icon={<Bookmark />}
        iconTone="caption"
        persist={persist}
      >
        <div className="space-y-3">
          <Field label="Saved preset">
            {(id) => (
              <Select
                id={id}
                value={selected}
                disabled={disabled}
                placeholder="Choose a preset…"
                options={allPresets.map((preset) => ({
                  value: preset.id,
                  label: preset.name,
                }))}
                onValueChange={(id) =>
                  apply(allPresets.find((preset) => preset.id === id)!)
                }
              />
            )}
          </Field>
          {dirty && (
            <p className="text-xs text-content-secondary">Unsaved changes</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              aria-expanded={!!panelHost}
              onClick={() => {
                setNaming(false);
                setRenameId(null);
                onBrowse();
              }}
            >
              <Settings2 />
              Manage presets
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => (current && !builtin ? save(true) : startCopy())}
            >
              <Save />
              {current && !builtin
                ? 'Update preset'
                : builtin
                  ? 'Save as new'
                  : 'Save preset'}
            </Button>
            {current && !builtin && (
              <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={startCopy}
              >
                <Copy />
                Save as new
              </Button>
            )}
          </div>
          {!panelHost && error && (
            <p role="alert" className="text-xs text-content-secondary">
              {error}
            </p>
          )}
        </div>
      </SidebarSection>
      {panelHost &&
        createPortal(
          <FloatingPanel
            title="Manage presets"
            description="Apply a layout or manage your saved presets."
            onClose={onClose}
            surface="solid"
            className="h-full w-full rounded-none shadow-none"
            footer={
              <div className="space-y-3">
                {form}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-0 gap-1.5 px-2 text-xs whitespace-nowrap"
                    disabled={disabled}
                    onClick={() => {
                      const preset = createPreset(
                        current?.id ?? createId(),
                        current?.name ?? 'Untitled',
                        layout,
                        icons,
                      );
                      const url = URL.createObjectURL(
                        new Blob([JSON.stringify(preset, null, 2)], {
                          type: 'application/json',
                        }),
                      );
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${preset.name.replace(/[^a-z0-9_-]/gi, '-')}.framenote.json`;
                      link.click();
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                    }}
                  >
                    <Download />
                    Export preset
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-0 gap-1.5 px-2 text-xs whitespace-nowrap"
                    disabled={disabled}
                    onClick={() => importInput.current?.click()}
                  >
                    <Upload />
                    Import preset
                  </Button>
                </div>
                {error && (
                  <p role="alert" className="text-xs text-content-secondary">
                    {error}
                  </p>
                )}
              </div>
            }
          >
            {(presets.length ? ['Built-in', 'Your presets'] : ['Built-in']).map(
              (group) => (
                <section key={group} className="mb-4">
                  <h3 className="px-3 py-2 text-xs text-label">{group}</h3>
                  <PickerList
                    selectedLabel=""
                    items={(group === 'Built-in'
                      ? builtinPresets
                      : presets
                    ).map((preset) => ({
                      id: preset.id,
                      label: preset.name,
                      selected: selected === preset.id,
                      actions: (
                        <div className="flex">
                          {' '}
                          <IconButton
                            label={`Duplicate ${preset.name}`}
                            disabled={disabled}
                            onClick={() => {
                              const copy = {
                                ...structuredClone(preset),
                                id: createId(),
                                name: `${preset.name} copy`,
                              };
                              if (store([...presets, copy])) {
                                setRenameId(copy.id);
                                setName(copy.name);
                                setNaming(true);
                              }
                            }}
                          >
                            <Copy />
                          </IconButton>
                          {group === 'Your presets' && (
                            <>
                              <IconButton
                                label={`Rename ${preset.name}`}
                                disabled={disabled}
                                onClick={() => {
                                  setRenameId(preset.id);
                                  setName(preset.name);
                                  setNaming(true);
                                  setError('');
                                }}
                              >
                                <Pencil />
                              </IconButton>
                              <IconButton
                                label={`Delete ${preset.name}`}
                                disabled={disabled}
                                onClick={() => {
                                  if (
                                    store(
                                      presets.filter((p) => p.id !== preset.id),
                                    )
                                  ) {
                                    if (selected === preset.id) setSelected('');
                                    if (renameId === preset.id)
                                      setNaming(false);
                                  }
                                }}
                              >
                                <Trash2 />
                              </IconButton>
                            </>
                          )}
                        </div>
                      ),
                    }))}
                    onChoose={(id) => {
                      if (!disabled)
                        apply(allPresets.find((p) => p.id === id)!);
                    }}
                  />
                </section>
              ),
            )}
          </FloatingPanel>,
          panelHost,
        )}
      <input
        ref={importInput}
        type="file"
        className="sr-only"
        aria-label="Import preset file"
        accept=".json,application/json"
        disabled={disabled}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (!file) return;
          try {
            if (file.size > 5_000_000)
              throw Error('Preset must be smaller than 5 MB.');
            const preset = {
              ...parsePreset(await file.text(), svgIcon),
              id: createId(),
            };
            if (store([...presets, preset])) apply(preset);
          } catch (cause) {
            setError(
              cause instanceof Error
                ? cause.message
                : 'Could not import preset.',
            );
          }
        }}
      />
    </>
  );
}
