import type { ReactNode } from 'react';
import { Check } from 'lucide-react';

export interface PickerItem {
  id: string;
  label: string;
  description?: ReactNode;
  selected?: boolean;
  preview?: ReactNode;
  leading?: ReactNode;
}
export function PickerList({
  items,
  onChoose,
  onHover,
  emptyText = 'No matches.',
  selectedLabel = 'Selected',
}: {
  items: readonly PickerItem[];
  onChoose: (id: string) => void;
  onHover?: (id: string | null) => void;
  emptyText?: string;
  selectedLabel?: string;
}) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <button
          type="button"
          key={item.id}
          aria-pressed={!!item.selected}
          onClick={() => onChoose(item.id)}
          onMouseEnter={() => onHover?.(item.id)}
          onMouseLeave={() => onHover?.(null)}
          className="control-option control-button block w-full rounded-lg p-3 text-left aria-pressed:bg-menu-item-selected aria-pressed:text-accent-color"
        >
          <span className="flex items-start justify-between gap-2">
            <span className="flex min-w-0 items-center gap-3 text-xs">
              {item.leading}
              <span className="min-w-0 break-all">{item.label}</span>
            </span>
            {item.selected && (
              <span className="flex shrink-0 items-center gap-1 text-[10px]">
                <Check aria-hidden="true" className="size-3.5" />
                {selectedLabel}
              </span>
            )}
          </span>
          {item.description && (
            <span className="mt-1 block break-all text-xs leading-5 text-content-secondary">
              {item.description}
            </span>
          )}
          {item.preview && <span className="mt-3 block">{item.preview}</span>}
        </button>
      ))}
      {items.length === 0 && (
        <p className="p-3 text-xs text-content-secondary">{emptyText}</p>
      )}
    </div>
  );
}
