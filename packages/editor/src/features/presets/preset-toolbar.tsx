import { Tooltip } from '@/components/ui/tooltip';
import { useId, type ReactNode } from 'react';
import { Save } from 'lucide-react';
import { Select, type SelectOption } from '@/components/ui/select';
import { SplitButton } from '@/components/ui/split-button';
import type { ActionMenuItem } from '@/components/ui/action-menu';

/** Same header controls before and after a photo is opened. */
export function PresetToolbar({
  selected,
  options,
  onSelect,
  onSave,
  items,
  modified = false,
  disabled = false,
  saveDisabled = false,
  warning,
  live = false,
}: {
  selected: string;
  options: readonly SelectOption[];
  onSelect: (id: string) => void;
  onSave: () => void;
  items: readonly ActionMenuItem[];
  modified?: boolean;
  disabled?: boolean;
  saveDisabled?: boolean;
  warning?: ReactNode;
  live?: boolean;
}) {
  const descriptionId = useId();
  const selectedName =
    options.find((item) => item.value === selected)?.label ?? 'Presets';
  const displayOptions = options.map((option) => ({
    ...option,
    label:
      option.value === selected && modified
        ? `${option.label} *`
        : option.label,
  }));
  return (
    <div
      className="flex min-w-0 items-center gap-2"
      aria-label="Layout presets"
      data-preset-live={live || undefined}
    >
      <div className="w-28 min-w-0 sm:w-44 lg:w-56 [&_button>span:first-child]:truncate">
        <Tooltip
          overflowOnly={!modified}
          content={
            modified ? `${selectedName} — Unsaved changes` : selectedName
          }
        >
          <Select
            aria-label="Saved preset"
            value={selected}
            aria-describedby={modified ? descriptionId : undefined}
            options={displayOptions}
            onValueChange={onSelect}
            disabled={disabled}
            placeholder="Presets…"
          />
        </Tooltip>
      </div>
      {modified && (
        <span id={descriptionId} role="status" className="sr-only">
          Unsaved changes
        </span>
      )}
      <SplitButton
        variant="outline"
        size="sm"
        aria-label="Save preset"
        primaryTooltip={
          saveDisabled
            ? 'The selected preset is up to date'
            : selected && !selected.startsWith('builtin-')
              ? 'Update the selected preset'
              : 'Save the current layout as a new preset'
        }
        menuLabel="Preset actions"
        disabled={disabled}
        primaryDisabled={saveDisabled}
        onClick={onSave}
        items={items}
      >
        <Save aria-hidden="true" />
        <span className="hidden sm:inline">Save preset</span>
      </SplitButton>
      {warning}
    </div>
  );
}
