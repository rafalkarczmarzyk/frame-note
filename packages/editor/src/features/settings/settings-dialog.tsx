import { useId, useState } from 'react';
import { Info, FileSearch, RotateCcw, X } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { NumberField } from '@/components/ui/number-field';
import { Switch } from '@/components/ui/switch';
import { InlineNotice } from '@/components/ui/inline-notice';

import type { SettingsValues } from '../../../../core/src/desktop-config';
const defaults = { history: 100, window: false, updates: true };
function Help({ label, children }: { label: string; children: string }) {
  return (
    <IconButton
      label={`About ${label}`}
      tooltip={children}
      className="text-content-secondary"
    >
      <Info aria-hidden="true" className="size-4" />
    </IconButton>
  );
}
export function SettingsDialog({
  initial,
  warning = '',
  onSave,
  onReveal,
  onClose,
}: {
  initial: SettingsValues;
  warning?: string;
  onSave(values: SettingsValues): Promise<void>;
  onReveal(): Promise<void>;
  onClose(): void;
}) {
  const [draft, setDraft] = useState(() => ({
    history: initial.historyLimit,
    window: initial.rememberWindow,
    updates: initial.checkUpdatesAtStartup,
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const title = useId();
  const valid =
    Number.isInteger(draft.history) &&
    draft.history >= 1 &&
    draft.history <= 1000;
  const toggleClass =
    'flex-1 items-center [&_label]:text-sm [&_label]:font-semibold [&_label]:text-content-primary';
  return (
    <Modal
      titleId={title}
      onClose={onClose}
      busy={busy}
      className="w-[min(600px,94vw)]"
    >
      <form
        noValidate
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy) return;
          if (!valid) {
            setError('Enter a whole number from 1 to 1000.');
            return;
          }
          setBusy(true);
          setError('');
          try {
            await onSave({
              historyLimit: draft.history,
              rememberWindow: draft.window,
              checkUpdatesAtStartup: draft.updates,
            });
            onClose();
          } catch {
            setError(
              'Could not save settings. Check that the configuration file is writable and try again. Your changes have not been applied.',
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <header className="relative space-y-2 px-8 pb-6 pt-8">
          <div className="absolute right-3 top-3">
            <IconButton
              label="Close Settings"
              disabled={busy}
              tooltip="Close Settings"
              onClick={() => onClose()}
            >
              <X aria-hidden="true" />
            </IconButton>
          </div>
          <h1 id={title} className="pr-12 font-display text-2xl font-semibold">
            Settings
          </h1>
        </header>
        <fieldset disabled={busy} className="space-y-6 border-0 px-8 pb-8">
          {warning && <InlineNotice tone="warning">{warning}</InlineNotice>}
          <section aria-labelledby={`${title}-editing`} className="space-y-3">
            <h2
              id={`${title}-editing`}
              className="text-xs font-semibold uppercase tracking-wider text-content-secondary"
            >
              Editing
            </h2>
            <div className="flex items-center gap-2 rounded-xl border border-panel-border bg-accordion-base p-4">
              <div className="min-w-0 flex-1 text-sm font-semibold">
                Undo steps per photo
              </div>
              <Help label="undo history">
                Keep 1–1000 undo steps per photo. Lowering the limit removes
                older steps when you save. Increasing it cannot restore them. A
                shared 64 MiB budget may shorten history sooner. Drag the arrows
                vertically to adjust, or click the value to type.
              </Help>
              <div className="w-28 shrink-0">
                <NumberField
                  hideLabel
                  disabled={busy}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      event.preventDefault();
                      onClose();
                    }
                  }}
                  label="Undo steps per photo"
                  value={draft.history}
                  onValueChange={(history) => {
                    setDraft({ ...draft, history });
                    setError('');
                  }}
                  min={1}
                  max={1000}
                  step={1}
                />
              </div>
            </div>
          </section>
          <section aria-labelledby={`${title}-startup`} className="space-y-3">
            <h2
              id={`${title}-startup`}
              className="text-xs font-semibold uppercase tracking-wider text-content-secondary"
            >
              On startup
            </h2>
            <div className="divide-y divide-panel-border rounded-xl border border-panel-border bg-accordion-base">
              <div className="flex items-center gap-2 p-4">
                <Switch
                  className={toggleClass}
                  label="Remember window position and size"
                  checked={draft.window}
                  onCheckedChange={(window) => setDraft({ ...draft, window })}
                />
                <Help label="window restoration">
                  Restore the window position, size and maximized state on next
                  startup. Off by default. Turning it off uses the default
                  window layout after restart; your current window stays
                  unchanged.
                </Help>
              </div>
              <div className="flex items-center gap-2 p-4">
                <Switch
                  className={toggleClass}
                  label="Check for updates at startup"
                  checked={draft.updates}
                  onCheckedChange={(updates) => setDraft({ ...draft, updates })}
                />
                <Help label="startup updates">
                  Check for new FrameNote releases on next startup. You can
                  always use Check for Updates in the application menu. Saving
                  this option does not start a check.
                </Help>
              </div>
            </div>
          </section>
          <section
            aria-labelledby={`${title}-configuration`}
            className="space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <h2
                id={`${title}-configuration`}
                className="text-xs font-semibold uppercase tracking-wider text-content-secondary"
              >
                Configuration
              </h2>
              <Help label="configuration file">
                Restart FrameNote after editing config.json manually. Saving
                settings or automatic preferences while the app is running may
                overwrite your file edits.
              </Help>
            </div>
            <div className="space-y-3 rounded-xl border border-panel-border bg-accordion-base p-4">
              <p className="break-all font-mono text-xs text-content-secondary">
                ~/FrameNote/config.json
              </p>
              <Button
                variant="outline"
                icon={<FileSearch aria-hidden="true" />}
                onClick={() => {
                  void onReveal().then(
                    () =>
                      setMessage(
                        'Configuration file shown in your file manager.',
                      ),
                    () => setMessage('Could not show the configuration file.'),
                  );
                }}
              >
                Show configuration file
              </Button>
              {message && <InlineNotice>{message}</InlineNotice>}
            </div>
          </section>
          {error && <InlineNotice tone="error">{error}</InlineNotice>}
        </fieldset>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-panel-border px-8 py-5">
          <Button
            variant="outline"
            icon={<RotateCcw aria-hidden="true" />}
            disabled={busy}
            onClick={() => {
              setDraft(defaults);
              setError('');
            }}
          >
            Restore defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" disabled={busy} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </footer>
      </form>
    </Modal>
  );
}
