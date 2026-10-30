import { Tooltip } from '@/components/ui/tooltip';
import type { ReactNode } from 'react';
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
  return (
    <div
      className="flex min-w-0 items-center gap-2"
      aria-label="Layout presets"
      data-preset-live={live || undefined}
    >
      <div className="w-28 min-w-0 sm:w-44 lg:w-56 [&_button>span:first-child]:truncate">
        <Tooltip
          overflowOnly
          content={
            options.find((item) => item.value === selected)?.label ?? 'Presets'
          }
        >
          <Select
            aria-label="Saved preset"
            value={selected}
            options={options}
            onValueChange={onSelect}
            disabled={disabled}
            placeholder="Presets…"
          />
        </Tooltip>
      </div>
      {modified && (
        <Tooltip content="The current layout has unsaved changes">
          <span
            role="status"
            className="shrink-0 text-xs text-content-secondary"
          >
            <span className="hidden lg:inline">Modified</span>
            <span className="lg:hidden" aria-label="Modified">
              •
            </span>
          </span>
        </Tooltip>
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
