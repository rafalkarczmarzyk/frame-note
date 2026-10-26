import { loadPhoto, type LoadedPhoto } from '@/features/photo/load-photo';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  startTransition,
} from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { EmptyWorkspace } from '@/features/photo/empty-workspace';
import { Download } from 'lucide-react';
import { PhotoActions } from '@/features/photo/photo-actions';
import { Button } from '@/components/ui/button';

const loadWorkspace = () => import('@/features/photo/photo-workspace');
const PhotoWorkspace = lazy(() =>
  loadWorkspace().then((module) => ({ default: module.PhotoWorkspace })),
);

export default function App() {
  const [isDragging, setIsDragging] = useState(false);

  const [photo, setPhoto] = useState<LoadedPhoto | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const currentPhoto = useRef<LoadedPhoto | null>(null);
  const loadedPhotos = useRef(new Set<LoadedPhoto>());
  const requestId = useRef(0);
  const importing = useRef(false);
  const previewReady = useCallback((readyPhoto: LoadedPhoto) => {
    if (!importing.current && currentPhoto.current === readyPhoto)
      setPreviewLoading(false);
  }, []);
  const openFile = useCallback(async (file: File) => {
    const id = ++requestId.current;
    importing.current = true;
    setLoading(true);
    setPreviewLoading(true);
    void loadWorkspace().catch(() => {});
    setError('');
    try {
      // Let the loading indicator paint before metadata parsing and decoding.
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      if (id !== requestId.current) return;
      const loaded = await loadPhoto(file);
      if (id !== requestId.current) {
        loaded.dispose();
        return;
      }
      loadedPhotos.current.add(loaded);
      currentPhoto.current = loaded;
      importing.current = false;
      startTransition(() => setPhoto(loaded));
    } catch (cause) {
      if (id === requestId.current) {
        setPreviewLoading(false);
        setError(
          cause instanceof Error ? cause.message : 'Could not open photo.',
        );
      }
    } finally {
      if (id === requestId.current) {
        importing.current = false;
        setLoading(false);
      }
    }
  }, []);
  const closePhoto = useCallback(() => {
    requestId.current += 1;
    importing.current = false;
    currentPhoto.current = null;
    setPhoto(null);
    setLoading(false);
    setPreviewLoading(false);
    setIsDragging(false);
    setError('');
  }, []);
  useEffect(() => {
    // Retire old bitmaps only after the replacement has committed to the UI.
    for (const loaded of loadedPhotos.current) {
      if (loaded !== photo && loaded !== currentPhoto.current) {
        loaded.dispose();
        loadedPhotos.current.delete(loaded);
      }
    }
  }, [photo]);
  useEffect(
    () => () => {
      requestId.current += 1;
      for (const loaded of loadedPhotos.current) loaded.dispose();
      loadedPhotos.current.clear();
    },
    [],
  );

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
      if (files?.length === 1 && files[0]) void openFile(files[0]);
      else if (files && files.length > 1)
        setError('Please add one photo at a time.');
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
  }, [openFile]);

  const loadingLabel = previewLoading
    ? loading
      ? 'Opening photo…'
      : 'Preparing preview…'
    : undefined;
  return (
    <div className="flex h-svh flex-col overflow-hidden bg-app-base text-content-primary">
      <AppHeader
        photoAction={
          <PhotoActions
            hasPhoto={!!photo}
            loading={loading}
            onOpen={() => input.current?.click()}
            onClose={closePhoto}
          />
        }
      >
        <div
          id="export-actions"
          className="[&:has(>button)>.export-placeholder]:hidden"
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
        accept="image/jpeg,image/png,.jpg,.jpeg,.png"
        aria-label="Choose JPG or PNG photo"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void openFile(file);
          event.target.value = '';
        }}
      />
      {error && (
        <div role="alert" className="border-b px-6 py-3 text-sm">
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
              draggingPhoto={isDragging}
              onChoosePhoto={() => input.current?.click()}
            />
          }
        >
          <PhotoWorkspace
            photo={photo}
            loading={loading}
            onChoosePhoto={() => input.current?.click()}
            onPreviewReady={previewReady}
            loadingLabel={loadingLabel}
            draggingPhoto={isDragging}
          />
        </Suspense>
      </div>
    </div>
  );
}
