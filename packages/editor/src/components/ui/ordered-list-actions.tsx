import { focusPickerAfterDelete } from '@/lib/picker-focus';
import type { RefObject } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
  Copy,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';
import { InlineInputGroup } from './inline-input-group';
import { IconButton } from './icon-button';
import { ActionMenu } from './action-menu';

/** Shared layer/effect commands and focus restoration, in visual stack order. */
export function OrderedListActions({
  noun,
  index,
  count,
  visible,
  root,
  onMove,
  onToggleVisibility,
  onDuplicate,
  onDelete,
  disabled = false,
  duplicateDisabled = false,
}: {
  noun: string;
  index: number;
  count: number;
  visible: boolean;
  root: RefObject<HTMLDivElement | null>;
  onMove: (index: number) => void;
  onToggleVisibility: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  disabled?: boolean;
  duplicateDisabled?: boolean;
}) {
  const move = (target: number) => {
    onMove(target);
    requestAnimationFrame(() => {
      const trigger = root.current?.querySelector<HTMLButtonElement>(
        `[data-picker-row="${target}"] button[aria-haspopup="menu"]`,
      );
      trigger?.focus({ preventScroll: true });
      trigger?.scrollIntoView({ block: 'nearest' });
    });
  };
  return (
    <InlineInputGroup
      label={`${noun} ${index + 1} actions`}
      className="control-segments shrink-0 px-1"
    >
      <IconButton
        disabled={disabled}
        aria-pressed={visible}
        className="control-segment layer-glass-button"
        label={`${visible ? 'Hide' : 'Show'} ${noun.toLowerCase()} ${index + 1}`}
        onClick={onToggleVisibility}
      >
        {visible ? <Eye /> : <EyeOff />}
      </IconButton>
      <ActionMenu
        disabled={disabled}
        triggerClassName="control-segment layer-glass-button"
        label={`${noun} ${index + 1} actions`}
        items={[
          {
            label: 'Duplicate',
            disabled: duplicateDisabled,
            disabledReason: 'Maximum 100 effects per layer',
            icon: <Copy aria-hidden="true" />,
            onSelect: onDuplicate,
          },
          {
            label: 'Move up',
            icon: <ArrowUp aria-hidden="true" />,
            separatorBefore: true,
            disabled: index === 0,
            disabledReason: `This ${noun.toLowerCase()} is already at the front`,
            onSelect: () => move(index - 1),
          },
          {
            label: 'Move down',
            icon: <ArrowDown aria-hidden="true" />,
            disabled: index === count - 1,
            disabledReason: `This ${noun.toLowerCase()} is already at the back`,
            onSelect: () => move(index + 1),
          },
          {
            label: 'Bring to front',
            icon: <ArrowUpToLine aria-hidden="true" />,
            disabled: index === 0,
            disabledReason: `This ${noun.toLowerCase()} is already at the front`,
            onSelect: () => move(0),
          },
          {
            label: 'Send to back',
            icon: <ArrowDownToLine aria-hidden="true" />,
            disabled: index === count - 1,
            disabledReason: `This ${noun.toLowerCase()} is already at the back`,
            onSelect: () => move(count - 1),
          },
          {
            label: 'Delete',
            icon: <Trash2 aria-hidden="true" />,
            separatorBefore: true,
            onSelect: () => {
              onDelete();
              focusPickerAfterDelete(root.current);
            },
          },
        ]}
      />
    </InlineInputGroup>
  );
}
