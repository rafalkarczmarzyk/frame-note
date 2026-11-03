import { ClipboardPaste, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

export function PhotoSettingsActions({
  copied,
  disabled = false,
  placement,
  onCopy,
  onPaste,
}: {
  copied: boolean;
  disabled?: boolean;
  placement: 'sidebar' | 'film';
  onCopy: () => void;
  onPaste: () => void;
}) {
  if (placement === 'sidebar')
    return (
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          icon={<Copy aria-hidden="true" />}
          disabled={disabled}
          onClick={onCopy}
        >
          Copy settings
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={<ClipboardPaste aria-hidden="true" />}
          disabled={disabled || !copied}
          onClick={onPaste}
        >
          Paste settings
        </Button>
      </div>
    );

  return (
    <>
      <Tooltip
        content="Copy all layout settings from this photo."
        disabledTrigger={disabled}
      >
        <button
          type="button"
          className="film-roll-settings-action"
          aria-label="Copy settings"
          disabled={disabled}
          onClick={onCopy}
        >
          <Copy className="size-3" aria-hidden="true" /> Copy
        </button>
      </Tooltip>
      <Tooltip
        content={
          copied
            ? 'Replace this photo’s layout with the copied settings.'
            : 'Copy settings from a photo first, then paste them here.'
        }
        disabledTrigger={disabled || !copied}
      >
        <button
          type="button"
          className="film-roll-settings-action"
          aria-label="Paste settings"
          disabled={disabled || !copied}
          onClick={onPaste}
        >
          <ClipboardPaste className="size-3" aria-hidden="true" /> Paste
        </button>
      </Tooltip>
    </>
  );
}
