import { loadPhoto, type LoadedPhoto } from '@/features/photo/load-photo';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { FrameNoteLogo } from '@/components/brand/frame-note-logo';
import { Button } from '@/components/ui/button';

const PhotoWorkspace = lazy(() =>
  import('@/features/photo/photo-workspace').then((module) => ({
    default: module.PhotoWorkspace,
  })),
);

export default function App() {
  const [isDragging, setIsDragging] = useState(false);

  const [photo, setPhoto] = useState<LoadedPhoto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const currentPhoto = useRef<LoadedPhoto | null>(null);
  const requestId = useRef(0);
  const openFile = useCallback(async (file: File) => {
    const id = ++requestId.current;
    setLoading(true);
    setError('');
    try {
      const loaded = await loadPhoto(file);
      if (id !== requestId.current) {
        loaded.dispose();
        return;
      }
      currentPhoto.current?.dispose();
      currentPhoto.current = loaded;
      setPhoto(loaded);
    } catch (cause) {
      if (id === requestId.current)
        setError(
          cause instanceof Error ? cause.message : 'Could not open photo.',
        );
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);
  useEffect(
    () => () => {
      requestId.current += 1;
      currentPhoto.current?.dispose();
    },
    [],
  );

  useEffect(() => {
    let depth = 0;
    const isFileDrag = (event: DragEvent) =>
      Array.from(event.dataTransfer?.types ?? []).includes('Files');
    const enter = (event: DragEvent) => {
      if (!isFileDrag(event)) return;
      event.preventDefault();
      depth += 1;
      setIsDragging(true);
    };
    const over = (event: DragEvent) => {
      if (!isFileDrag(event)) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    };
    const leave = () => {
      depth = Math.max(0, depth - 1);
      if (depth === 0) setIsDragging(false);
    };
    const reset = () => {
      depth = 0;
      setIsDragging(false);
    };
    const drop = (event: DragEvent) => {
      if (isFileDrag(event)) event.preventDefault();
      const files = event.dataTransfer?.files;
      if (files?.length === 1 && files[0]) void openFile(files[0]);
      else if (files && files.length > 1)
        setError('Please add one photo at a time.');
      reset();
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') reset();
    };
    window.addEventListener('dragenter', enter);
    window.addEventListener('dragover', over);
    window.addEventListener('dragleave', leave);
    window.addEventListener('drop', drop);
    window.addEventListener('dragend', reset);
    window.addEventListener('blur', reset);
    window.addEventListener('keydown', keydown);
    return () => {
      window.removeEventListener('dragenter', enter);
      window.removeEventListener('dragover', over);
      window.removeEventListener('dragleave', leave);
      window.removeEventListener('drop', drop);
      window.removeEventListener('dragend', reset);
      window.removeEventListener('blur', reset);
      window.removeEventListener('keydown', keydown);
    };
  }, [openFile]);

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-[76px] shrink-0 items-center justify-between bg-secondary px-6 text-secondary-foreground sm:px-10">
        <a
          href="/"
          aria-label="FrameNote home"
          className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <FrameNoteLogo className="h-8 w-auto text-current" />
        </a>
        {photo && (
          <Button onClick={() => input.current?.click()} disabled={loading}>
            Change photo
          </Button>
        )}
      </header>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,.jpg,.jpeg"
        aria-label="Choose JPG photo"
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
      {loading && (
        <p role="status" className="px-6 py-2 text-sm">
          Opening photo…
        </p>
      )}
      {photo ? (
        <Suspense
          fallback={
            <p role="status" className="p-6">
              Preparing preview…
            </p>
          }
        >
          <PhotoWorkspace
            key={photo.document.photo.name + photo.document.photo.byteLength}
            photo={photo}
          />
        </Suspense>
      ) : (
        <main className="flex flex-1 items-center justify-center px-6 py-12">
          <section className="text-center" aria-labelledby="upload-title">
            <h1
              id="upload-title"
              className="font-display text-4xl font-normal tracking-tight sm:text-5xl"
            >
              Every frame has a story.
            </h1>
            <Button
              className="mt-8 px-6"
              disabled={loading}
              onClick={() => input.current?.click()}
            >
              Choose a photo
            </Button>
            <p className="mt-4 text-sm text-foreground/70">
              or drag and drop it anywhere
            </p>
          </section>
        </main>
      )}
      {isDragging && (
        <div
          className="pointer-events-none fixed inset-0 z-50 bg-secondary p-5 text-secondary-foreground sm:p-8"
          role="status"
        >
          <div className="flex h-full items-center justify-center rounded-3xl border-[5px] border-dashed border-secondary-foreground p-6">
            <p className="text-center font-display text-4xl font-normal tracking-tight sm:text-6xl">
              Drop your photo
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
