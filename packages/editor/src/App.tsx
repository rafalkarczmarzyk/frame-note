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
} from 'react';
import { AppHeader, type WindowChrome } from '@/components/layout/app-header';
import { EmptyWorkspace } from '@/features/photo/empty-workspace';
import { Download } from 'lucide-react';
import { PhotoActions } from '@/features/photo/photo-actions';
import { Button } from '@/components/ui/button';

const loadWorkspace = () => import('@/features/photo/photo-workspace');
const PhotoWorkspace = lazy(() =>
  loadWorkspace().then((module) => ({ default: module.PhotoWorkspace })),
);

export default function App({
  windowChrome = 'standard',
}: { windowChrome?: WindowChrome } = {}) {
  const [isDragging, setIsDragging] = useState(false);

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
    document: editorDocument,
    documentKey,
  } = usePhotoSession();
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
    if (
      window.confirm(
        `Close all ${session.items.length} photos and discard their individual edits? Source files and saved presets will not be deleted.`,
      )
    ) {
      disposeRoll();
      setIsDragging(false);
    }
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
      <AppHeader
        windowChrome={windowChrome}
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
        <Suspense
          fallback={
            <EmptyWorkspace
              loading
              loadingLabel={loadingLabel}
              onCancelLoading={cancelLoading}
              draggingPhoto={isDragging}
              onChoosePhoto={() => input.current?.click()}
            />
          }
        >
          <PhotoWorkspace
            photo={photo}
            sessionDocument={editorDocument}
            onDocumentChange={updateDocument}
            documentKey={documentKey}
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
                  activePhotoId={session.activeId ?? undefined}
                  onSelectPhoto={(id) => void selectPhoto(id)}
                  disabled={loading || !!batch}
                />
              ) : undefined
            }
            loading={loading}
            onChoosePhoto={() => input.current?.click()}
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
