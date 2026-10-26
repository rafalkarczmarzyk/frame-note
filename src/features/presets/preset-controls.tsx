import { PresetStore } from './preset-store';
import { createId } from '@/lib/create-id';
import { PresetToolbar } from './preset-toolbar';
import { CategoryFilter } from '@/components/ui/category-filter';
import { PickerList } from '@/components/ui/picker-list';
import { builtinPresets } from '@/domain/builtin-presets';
import { useRef, useState } from 'react';
import {
  Download,
  Upload,
  Save,
  Copy,
  Trash2,
  Settings2,
  Pencil,
  X,
} from 'lucide-react';
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
  copyPresetName,
  presetNameLimit,
  type LayoutPreset,
} from '@/domain/presets';
import { prepareImageAssets } from '../caption/image-assets';
import { svgIcon } from '../caption/svg-icons';

export function PresetControls({
  layout,
  icons,
  onApply,
  disabled = false,
  persist = true,
  panelHost,
  toolbarHost,
  initialPresetId = 'builtin-default',
  onBrowse,
  onClose,
}: {
  layout: CaptionLayout;
  icons: SvgAsset[];
  onApply: (preset: LayoutPreset) => void;
  disabled?: boolean;
  persist?: boolean;
  panelHost: HTMLElement | null;
  toolbarHost: HTMLElement | null;
  initialPresetId?: string;
  onBrowse: () => void;
  onClose: () => void;
}) {
  const importInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const revealPresets = () => {
    setQuery('');
    setCategory('all');
  };
  const [collection] = useState(
    () =>
      new PresetStore(
        persist
          ? {
              getItem: (key) => localStorage.getItem(key),
              setItem: (key, value) => localStorage.setItem(key, value),
            }
          : null,
        svgIcon,
      ),
  );
  const [presets, setPresets] = useState(collection.presets);
  const [selected, setSelected] = useState(initialPresetId);
  const [name, setName] = useState('');
  const [naming, setNaming] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const allPresets = [...builtinPresets, ...presets];
  const search = query.trim().toLocaleLowerCase();
  const visibleGroups = [
    { id: 'builtin', label: 'Built-in', presets: builtinPresets },
    { id: 'user', label: 'Your presets', presets },
  ]
    .filter((group) => category === 'all' || category === group.id)
    .map((group) => ({
      ...group,
      presets: group.presets.filter((preset) =>
        preset.name.toLocaleLowerCase().includes(search),
      ),
    }))
    .filter((group) => group.presets.length > 0);
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
    setName(current ? copyPresetName(current.name) : '');
    setNaming(true);
    onBrowse();
  };
  const store = (update: (current: LayoutPreset[]) => LayoutPreset[]) => {
    try {
      setPresets(collection.commit(update));
      setError('');
      return true;
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not save presets.',
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
    const next = (latest: LayoutPreset[]) =>
      replace && current && !builtin
        ? latest.map((item) => (item.id === current.id ? preset : item))
        : [...latest, preset];
    if (store(next)) {
      setSelected(preset.id);
      setNaming(false);
      if (!replace) revealPresets();
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
            store((latest) =>
              latest.map((p) =>
                p.id === renameId ? { ...p, name: name.trim() } : p,
              ),
            )
          ) {
            setNaming(false);
            setRenameId(null);
            revealPresets();
          }
        } else save(false);
      }}
    >
      <Field label="Preset name">
        {(id) => (
          <Input
            id={id}
            value={name}
            maxLength={presetNameLimit}
            autoFocus
            data-panel-initial-focus
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
      {toolbarHost &&
        createPortal(
          <PresetToolbar
            live
            selected={selected}
            options={allPresets.map((preset, index) => ({
              value: preset.id,
              label: preset.name,
              separatorBefore: index === builtinPresets.length,
            }))}
            onSelect={(id) =>
              apply(allPresets.find((preset) => preset.id === id)!)
            }
            modified={!!dirty}
            disabled={disabled}
            saveDisabled={!!current && !builtin && !dirty}
            onSave={() => (current && !builtin ? save(true) : startCopy())}
            items={[
              {
                label: 'Save as new',
                icon: <Save />,
                disabled,
                onSelect: startCopy,
              },
              {
                label: 'Duplicate',
                icon: <Copy />,
                disabled: disabled || !current,
                onSelect: () => {
                  if (!current) return;
                  const copy = {
                    ...structuredClone(current),
                    id: createId(),
                    name: copyPresetName(current.name),
                  };
                  if (store((latest) => [...latest, copy])) {
                    revealPresets();
                    setRenameId(copy.id);
                    setName(copy.name);
                    setNaming(true);
                    onBrowse();
                  }
                },
              },
              {
                label: 'Rename',
                icon: <Pencil />,
                disabled: disabled || !current || builtin,
                onSelect: () => {
                  if (!current || builtin) return;
                  setRenameId(current.id);
                  setName(current.name);
                  setNaming(true);
                  setError('');
                  onBrowse();
                },
              },
              {
                label: 'Manage presets',
                icon: <Settings2 />,
                disabled,
                separatorBefore: true,
                onSelect: () => {
                  setNaming(false);
                  setRenameId(null);
                  onBrowse();
                },
              },
            ]}
            warning={
              collection.warning || (!panelHost && error) ? (
                <IconButton
                  label="Preset warning — manage presets"
                  onClick={onBrowse}
                >
                  <Settings2 />
                </IconButton>
              ) : undefined
            }
          />,
          toolbarHost,
        )}
      {panelHost &&
        createPortal(
          <FloatingPanel
            title="Manage presets"
            description="Apply a layout or manage your saved presets."
            onClose={onClose}
            surface="solid"
            className="h-full w-full rounded-none shadow-none"
            toolbar={
              <>
                <Input
                  aria-label="Search presets"
                  placeholder="Search presets…"
                  value={query}
                  data-panel-initial-focus={!naming || undefined}
                  onChange={(event) => setQuery(event.target.value)}
                  className="bg-preview-placeholder"
                />
                <CategoryFilter
                  label="Preset categories"
                  className="mt-2"
                  value={category}
                  onValueChange={setCategory}
                  categories={[
                    { value: 'builtin', label: 'Built-in' },
                    { value: 'user', label: 'Your presets' },
                  ]}
                />
              </>
            }
            footer={
              <div className="space-y-3">
                {collection.warning && (
                  <div className="space-y-2">
                    <p role="alert" className="text-xs text-content-secondary">
                      {collection.warning}
                    </p>
                    {collection.original !== null && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const url = URL.createObjectURL(
                            new Blob([collection.original!], {
                              type: 'application/json',
                            }),
                          );
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = 'framenote-presets-recovery.json';
                          link.click();
                          setTimeout(() => URL.revokeObjectURL(url), 1000);
                        }}
                      >
                        Download recovery copy
                      </Button>
                    )}
                  </div>
                )}
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
                      try {
                        parsePreset(JSON.stringify(preset), svgIcon);
                      } catch (cause) {
                        setError(
                          cause instanceof Error
                            ? cause.message
                            : 'Invalid preset.',
                        );
                        return;
                      }
                      const blob = new Blob([JSON.stringify(preset, null, 2)], {
                        type: 'application/json',
                      });
                      if (blob.size > 5_000_000) {
                        setError(
                          'Preset exceeds 5 MB. Use smaller image files or fewer images.',
                        );
                        return;
                      }
                      const url = URL.createObjectURL(blob);
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
            {visibleGroups.length === 0 && (
              <p role="status" className="p-3 text-xs text-content-secondary">
                {category === 'user' && !presets.length && !search
                  ? 'No saved presets yet.'
                  : 'No presets match your search or filter.'}
              </p>
            )}
            {visibleGroups.map((group) => (
              <section key={group.id} className="mb-4">
                <h3 className="px-3 py-2 text-xs text-label">{group.label}</h3>
                <PickerList
                  selectedLabel=""
                  items={group.presets.map((preset) => ({
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
                              name: copyPresetName(preset.name),
                            };
                            if (store((latest) => [...latest, copy])) {
                              revealPresets();
                              setRenameId(copy.id);
                              setName(copy.name);
                              setNaming(true);
                            }
                          }}
                        >
                          <Copy />
                        </IconButton>
                        {group.id === 'user' && (
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
                                  store((latest) =>
                                    latest.filter((p) => p.id !== preset.id),
                                  )
                                ) {
                                  if (selected === preset.id) setSelected('');
                                  if (renameId === preset.id) setNaming(false);
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
                    if (!disabled) apply(allPresets.find((p) => p.id === id)!);
                  }}
                />
              </section>
            ))}
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
            await Promise.all(
              preset.layout.containers.map((container) =>
                prepareImageAssets(container.images),
              ),
            );
            if (store((latest) => [...latest, preset])) {
              revealPresets();
              apply(preset);
            }
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
