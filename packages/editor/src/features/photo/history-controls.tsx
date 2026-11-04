import { Undo2, Redo2 } from 'lucide-react';
import { IconButton } from '@/components/ui/icon-button';
import { usePlatform } from '@/hooks/use-platform';

export interface HistoryStatus {
  canUndo: boolean;
  canRedo: boolean;
  undoLabel?: string;
  redoLabel?: string;
  truncated: boolean;
}
export function HistoryControls({
  status,
  disabled = false,
  onUndo,
  onRedo,
}: {
  status: HistoryStatus;
  disabled?: boolean;
  onUndo: () => void;
  onRedo: () => void;
}) {
  const { isMacOS, isWeb } = usePlatform();
  const modifier = isMacOS ? '⌘' : isWeb ? 'Ctrl/Cmd+' : 'Ctrl+';
  return (
    <div
      role="group"
      aria-label="Edit history"
      className="flex shrink-0 items-center"
    >
      <IconButton
        label="Undo"
        disabled={disabled || !status.canUndo}
        tooltip={`Undo${status.undoLabel ? ` ${status.undoLabel}` : ''} · ${modifier}Z${status.truncated ? ' · Older history was cleared to stay within the memory limit' : ''}`}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onUndo}
      >
        <Undo2 className="size-4" aria-hidden="true" />
      </IconButton>
      <IconButton
        label="Redo"
        disabled={disabled || !status.canRedo}
        tooltip={`Redo${status.redoLabel ? ` ${status.redoLabel}` : ''} · ${modifier}Shift+Z`}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onRedo}
      >
        <Redo2 className="size-4" aria-hidden="true" />
      </IconButton>
    </div>
  );
}
