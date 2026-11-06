import { HistoryControls } from '@/features/photo/history-controls';
import { platform } from '@/lib/platform';
import { usePhotoSession } from '@/features/photo/use-photo-session';
import {
  exportRoll,
  rollWarnings,
  type RollExportOptions,
} from '@/features/photo/export-roll';
import { FilmRoll } from '@/components/ui/film-roll';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { EmptyWorkspace } from '@/features/photo/empty-workspace';
import { Download, X } from 'lucide-react';
import { PhotoActions } from '@/features/photo/photo-actions';
import { PhotoSettingsActions } from '@/features/photo/photo-settings-actions';
import { ToolSidebarFooter } from '@/components/layout/editor-workspace';
import type { SessionDocument } from '@/features/photo/session-document';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

const loadWorkspace = () => import('@/features/photo/photo-workspace');
const PhotoWorkspace = lazy(() =>
  loadWorkspace().then((module) => ({ default: module.PhotoWorkspace })),
);

export default function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [pendingDisposeRoll, setPendingDisposeRoll] = useState(false);
  const [configWarning, setConfigWarning] = useState(() =>
    platform().configuration?.warning(),
  );
  useEffect(
    () =>
      platform().configuration?.subscribe(() =>
        setConfigWarning(platform().configuration?.warning()),
      ),
    [],
  );
  const [availableUpdate, setAvailableUpdate] = useState<{
    version: string;
    url: string;
  } | null>(null);
  const [updateCheckMessage, setUpdateCheckMessage] = useState('');
  useEffect(() => {
    const desktop = (
      window as Window & {
        frameNoteDesktop?: {
          checkUpdates(): Promise<
            | { status: 'available'; release: { version: string; url: string } }
            | { status: 'current' | 'error' }
          >;
        };
      }
    ).frameNoteDesktop;
    if (!desktop) return;
    let active = true;
    const check = (manual: boolean) => {
      void desktop
        .checkUpdates()
        .then((result) => {
          if (!active) return;
          if (result.status === 'available') {
            setUpdateCheckMessage('');
            setAvailableUpdate(result.release);
          } else if (manual) {
            setUpdateCheckMessage(
              result.status === 'current'
                ? 'You’re using the latest version.'
                : 'Could not check for updates. Try again later.',
            );
            setTimeout(() => setUpdateCheckMessage(''), 5000);
          }
        })
        .catch(() => {
          if (active && manual) {
            setUpdateCheckMessage(
              'Could not check for updates. Try again later.',
            );
            setTimeout(() => setUpdateCheckMessage(''), 5000);
          }
        });
    };
    const onManualCheck = () => check(true);
    window.addEventListener('framenote-check-updates', onManualCheck);
    if (platform().configuration?.current().checkUpdatesAtStartup !== false)
      check(false);
    return () => {
      active = false;
      window.removeEventListener('framenote-check-updates', onManualCheck);
    };
  }, []);

  const {
    session,
    photo,
    progress,
    previewLoading,
    error,
    setError,
    openFiles,
    selectPhoto,
    closePhoto,
    disposeRoll,
    cancelImport,
    previewReady,
    updateDocument,
    beginEdit,
    finishEdit,
    finishTyping,
    cancelEdit,
    restoreHistory,
    historyStatus,
    retainSettings,
    copySettings,
    pasteSettings,
    document: editorDocument,
    documentKey,
  } = usePhotoSession();
  const viewKeys = useMemo(
    () => session.items.map((item) => item.id),
    [session.items],
  );
  const historyActions = useMemo(
    () => ({ beginEdit, finishEdit, finishTyping, cancelEdit }),
    [beginEdit, finishEdit, finishTyping, cancelEdit],
  );
  const [copiedSettings, setCopiedSettings] = useState<SessionDocument | null>(
    null,
  );
  const [settingsFeedback, setSettingsFeedback] = useState('');
  const settingsFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const showSettingsFeedback = (message: string) => {
    setSettingsFeedback(message);
    if (settingsFeedbackTimer.current)
      clearTimeout(settingsFeedbackTimer.current);
    settingsFeedbackTimer.current = setTimeout(
      () => setSettingsFeedback(''),
      2000,
    );
  };
  const loading = !!progress;
  const input = useRef<HTMLInputElement>(null);
  const batchAbort = useRef<AbortController | null>(null);
  const importQueue = useRef<File[][]>([]);
  const drainingImports = useRef(false);
  const [batch, setBatch] = useState<{
    completed: number;
    total: number;
    name: string;
  } | null>(null);
  const addFiles = useCallback(
    (files: readonly File[]) => {
      if (batchAbort.current) return;
      void loadWorkspace().catch(() => {});
      importQueue.current.push([...files]);
      if (drainingImports.current) return;
      drainingImports.current = true;
      void (async () => {
        try {
          while (importQueue.current.length) {
            const next = importQueue.current.shift();
            if (next) await openFiles(next);
          }
        } finally {
          drainingImports.current = false;
        }
      })();
    },
    [openFiles],
  );
  useEffect(
    () => () => {
      importQueue.current = [];
      batchAbort.current?.abort();
      if (settingsFeedbackTimer.current)
        clearTimeout(settingsFeedbackTimer.current);
    },
    [],
  );
  const stopImport = () => {
    importQueue.current = [];
    cancelImport();
  };

  const exportAll = async (options: RollExportOptions) => {
    if (batchAbort.current || loading || session.items.length < 2) return;
    const items = session.items.map((item) => ({
      ...item,
      editor: structuredClone(item.editor),
    }));
    const warnings = rollWarnings(items);
    if (
      warnings.length &&
      !window.confirm(
        `${warnings.length} photos have missing fields or invalid tokens:\n\n${warnings.join('\n')}\n\nExport all anyway?`,
      )
    )
      return;
    const controller = new AbortController();
    batchAbort.current = controller;
    setError('');
    setBatch({ completed: 0, total: items.length, name: '' });
    try {
      const result = await exportRoll(
        items,
        options,
        controller.signal,
        (completed, name) => setBatch({ completed, total: items.length, name }),
      );
      controller.signal.throwIfAborted();
      if (result.blob) {
        await platform().saveFile(result.blob, 'framenote-roll.zip');
      }
      if (result.failures.length)
        setError(
          `${result.completed} of ${items.length} photos exported.\n${result.failures.join('\n')}`,
        );
    } catch (cause) {
      if (!controller.signal.aborted)
        setError(
          cause instanceof Error ? cause.message : 'Could not export the roll.',
        );
    } finally {
      if (batchAbort.current === controller) {
        batchAbort.current = null;
        setBatch(null);
      }
    }
  };
  const discardRoll = () => {
    if (batchAbort.current || !session.items.length) return;
    setPendingDisposeRoll(true);
  };

  useEffect(() => {
    const isFileDrag = (event: DragEvent) =>
      Array.from(event.dataTransfer?.types ?? []).includes('Files');
    const overCanvas = (target: EventTarget | null) =>
      target instanceof Element && !!target.closest('[data-photo-canvas]');
    const overContent = (target: EventTarget | null) =>
      target instanceof Element &&
      !!target.closest('[data-content-image-drop]');
    const enter = (event: DragEvent) => {
      if (!isFileDrag(event)) return;
      event.preventDefault();
      setIsDragging(overCanvas(event.target));
    };
    const over = (event: DragEvent) => {
      if (!isFileDrag(event)) return;
      // Prevent native navigation even outside the accepted drop area.
      event.preventDefault();
      const accepted = overCanvas(event.target);
      if (event.dataTransfer)
        event.dataTransfer.dropEffect =
          accepted || overContent(event.target) ? 'copy' : 'none';
      setIsDragging(accepted);
      if (!accepted && !overContent(event.target)) event.stopPropagation();
    };
    const leave = (event: DragEvent) => {
      if (!isFileDrag(event)) return;
      const destination =
        event.relatedTarget ??
        document.elementFromPoint(event.clientX, event.clientY);
      setIsDragging(overCanvas(destination));
    };
    const reset = () => setIsDragging(false);
    const drop = (event: DragEvent) => {
      if (!isFileDrag(event)) return;
      event.preventDefault();
      reset();
      if (!overCanvas(event.target)) {
        if (!overContent(event.target)) event.stopPropagation();
        return;
      }
      const files = event.dataTransfer?.files;
      if (files?.length) addFiles(Array.from(files));
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') reset();
    };
    window.addEventListener('dragenter', enter);
    window.addEventListener('dragover', over, true);
    window.addEventListener('dragleave', leave);
    window.addEventListener('drop', drop, true);
    window.addEventListener('dragend', reset);
    window.addEventListener('blur', reset);
    window.addEventListener('keydown', keydown);
    return () => {
      window.removeEventListener('dragenter', enter);
      window.removeEventListener('dragover', over, true);
      window.removeEventListener('dragleave', leave);
      window.removeEventListener('drop', drop, true);
      window.removeEventListener('dragend', reset);
      window.removeEventListener('blur', reset);
      window.removeEventListener('keydown', keydown);
    };
  }, [addFiles]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        !(event.metaKey || event.ctrlKey) ||
        event.altKey
      )
        return;
      const key = event.key.toLowerCase();
      const direction =
        key === 'z'
          ? event.shiftKey
            ? 'redo'
            : 'undo'
          : key === 'y' && event.ctrlKey && !event.metaKey
            ? 'redo'
            : null;
      if (!direction) return;
      const target = event.target;
      if (target instanceof Element && target.closest('dialog')) return;
      if (
        target instanceof HTMLInputElement &&
        !['number', 'color', 'range'].includes(target.type) &&
        !target.hasAttribute('data-layout-draft')
      )
        return;
      if (target instanceof HTMLTextAreaElement) return;
      event.preventDefault();
      if (!loading && !batch) restoreHistory(direction);
    };
    window.addEventListener('keydown', keydown, true);
    return () => window.removeEventListener('keydown', keydown, true);
  }, [restoreHistory, loading, batch]);

  useEffect(
    () =>
      platform().onHistoryCommand?.((direction) => {
        const target = document.activeElement;
        if (target instanceof Element && target.closest('dialog')) return;
        if (
          target instanceof HTMLTextAreaElement ||
          (target instanceof HTMLInputElement &&
            !['number', 'color', 'range'].includes(target.type) &&
            !target.hasAttribute('data-layout-draft'))
        ) {
          document.execCommand(direction);
          return;
        }
        if (!loading && !batch) restoreHistory(direction);
      }),
    [restoreHistory, loading, batch],
  );
  useEffect(() => {
    platform().updateHistoryMenu?.({
      ...historyStatus,
      canUndo: !loading && !batch && historyStatus.canUndo,
      canRedo: !loading && !batch && historyStatus.canRedo,
    });
  }, [historyStatus, loading, batch]);

  const loadingLabel = batch
    ? `Exporting ${Math.min(batch.completed + 1, batch.total)} of ${batch.total}`
    : progress && progress.total > 1
      ? `Adding photos · ${progress.done} of ${progress.total}`
      : previewLoading || progress
        ? 'Preparing preview…'
        : undefined;
  const cancelLoading = batch
    ? () => batchAbort.current?.abort()
    : progress
      ? stopImport
      : undefined;

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-app-base text-content-primary">
      {pendingDisposeRoll && (
        <ConfirmationDialog
          title="Dispose roll?"
          description={`Close all ${session.items.length} photos and discard their individual edits? Source files and saved presets will not be deleted.`}
          confirmLabel="Dispose roll"
          onCancel={() => setPendingDisposeRoll(false)}
          onConfirm={() => {
            if (batchAbort.current) return;
            disposeRoll();
            setIsDragging(false);
            setPendingDisposeRoll(false);
          }}
        />
      )}
      {configWarning && (
        <div
          role="alert"
          className="border-b border-panel-border px-6 py-3 text-xs"
        >
          {configWarning}
        </div>
      )}
      <AppHeader
        historyAction={
          <HistoryControls
            status={historyStatus}
            disabled={loading || !!batch}
            onUndo={() => restoreHistory('undo')}
            onRedo={() => restoreHistory('redo')}
          />
        }
        photoAction={
          <PhotoActions
            hasPhoto={session.items.length > 0}
            loading={loading || !!batch}
            onOpen={() => input.current?.click()}
            onClose={closePhoto}
            photoCount={session.items.length}
            onDisposeRoll={discardRoll}
          />
        }
      >
        <div
          id="export-actions"
          className="[&:has(>[data-export-live])>.export-placeholder]:hidden"
        >
          <div className="export-placeholder">
            <Button
              size="sm"
              disabled
              aria-label="Export JPG"
              className="px-2 sm:px-3"
            >
              <Download className="md:hidden" aria-hidden="true" />
              <span className="hidden md:inline">Export JPG</span>
            </Button>
          </div>
        </div>
      </AppHeader>
      <input
        ref={input}
        type="file"
        multiple
        accept="image/jpeg,image/png,.jpg,.jpeg,.png"
        aria-label="Choose JPG or PNG photo"
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) addFiles(files);
          event.target.value = '';
        }}
      />
      {error && (
        <div
          role="alert"
          className="max-h-32 shrink-0 overflow-y-auto border-b px-6 py-3 text-sm whitespace-pre-line"
        >
          {error}
        </div>
      )}
      <div
        className="relative flex min-h-0 flex-1 flex-col"
        aria-busy={previewLoading}
      >
        {availableUpdate && (
          <div
            className="glass-popover absolute top-3 left-1/2 z-50 flex max-w-[calc(100%-24px)] -translate-x-1/2 items-center gap-3 rounded-xl border border-panel-border px-4 py-3 text-sm shadow-panel"
            role="status"
          >
            <Download
              className="size-4 shrink-0 text-content-primary"
              aria-hidden="true"
            />
            <span className="whitespace-nowrap">
              FrameNote {availableUpdate.version} is available
            </span>
            <Button
              size="sm"
              onClick={() => {
                const desktop = (
                  window as Window & {
                    frameNoteDesktop?: {
                      openRelease(url: string): Promise<void>;
                    };
                  }
                ).frameNoteDesktop;
                void desktop?.openRelease(availableUpdate.url);
              }}
            >
              View release
            </Button>
            <button
              type="button"
              aria-label="Dismiss update notification"
              className="rounded p-1 text-content-secondary hover:text-content-primary focus-visible:outline-2 focus-visible:outline-input-focus-ring"
              onClick={() => setAvailableUpdate(null)}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
        {updateCheckMessage && !availableUpdate && (
          <div
            className="glass-popover absolute top-3 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-panel-border px-4 py-3 text-sm shadow-panel"
            role="status"
          >
            {updateCheckMessage}
          </div>
        )}
        <Suspense
          fallback={
            <EmptyWorkspace
              loadingLabel={loadingLabel}
              onCancelLoading={cancelLoading}
              draggingPhoto={isDragging}
            />
          }
        >
          <PhotoWorkspace
            photo={photo}
            sessionDocument={editorDocument}
            onDocumentChange={updateDocument}
            documentKey={documentKey}
            viewKeys={viewKeys}
            historyActions={historyActions}
            settingsFeedback={settingsFeedback}
            sidebarFooter={
              session.items.length > 0 ? (
                <ToolSidebarFooter aria-label="Photo settings actions">
                  <PhotoSettingsActions
                    placement="sidebar"
                    copied={copiedSettings !== null}
                    disabled={loading || !!batch}
                    onCopy={() => {
                      const copied = copySettings();
                      if (copied) {
                        retainSettings(copied);
                        setCopiedSettings(copied);
                        showSettingsFeedback(
                          `Settings copied from ${photo?.document.photo.name ?? 'photo'}.`,
                        );
                      }
                    }}
                    onPaste={() => {
                      if (copiedSettings && session.activeId) {
                        pasteSettings(session.activeId, copiedSettings);
                        showSettingsFeedback(
                          `Settings pasted to ${photo?.document.photo.name ?? 'photo'}.`,
                        );
                      }
                    }}
                  />
                </ToolSidebarFooter>
              ) : undefined
            }
            batchBusy={!!batch}
            onExportAll={session.items.length > 1 ? exportAll : undefined}
            filmRoll={
              session.items.length > 1 ? (
                <FilmRoll
                  className="shrink-0"
                  photos={session.items.map((item) => ({
                    id: item.id,
                    src: item.thumbnailUrl,
                    name: item.photo.name,
                  }))}
                  renderPhotoActions={(item) => (
                    <PhotoSettingsActions
                      placement="film"
                      copied={copiedSettings !== null}
                      disabled={loading || !!batch}
                      onCopy={() => {
                        const copied = copySettings(item.id);
                        if (copied) {
                          retainSettings(copied);
                          setCopiedSettings(copied);
                          showSettingsFeedback(
                            `Settings copied from ${item.name}.`,
                          );
                        }
                      }}
                      onPaste={() => {
                        if (copiedSettings) {
                          pasteSettings(item.id, copiedSettings);
                          showSettingsFeedback(
                            `Settings pasted to ${item.name}.`,
                          );
                        }
                      }}
                    />
                  )}
                  activePhotoId={session.activeId ?? undefined}
                  onSelectPhoto={(id) => void selectPhoto(id)}
                  disabled={loading || !!batch}
                />
              ) : undefined
            }
            loading={loading}
            onPreviewReady={previewReady}
            loadingLabel={loadingLabel}
            onCancelLoading={cancelLoading}
            draggingPhoto={isDragging}
          />
        </Suspense>
      </div>
    </div>
  );
}
