import { useEffect, useState } from 'react';
import { FrameNoteLogo } from '@/components/brand/frame-note-logo';
import { Button } from '@/components/ui/button';

export default function App() {
  const [isDragging, setIsDragging] = useState(false);

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
  }, []);

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="flex h-[76px] shrink-0 items-center bg-secondary px-6 text-secondary-foreground sm:px-10">
        <a
          href="/"
          aria-label="FrameNote home"
          className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <FrameNoteLogo className="h-8 w-auto text-current" />
        </a>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <section className="text-center" aria-labelledby="upload-title">
          <h1
            id="upload-title"
            className="font-display text-4xl font-normal tracking-tight sm:text-5xl"
          >
            Every frame has a story.
          </h1>
          <Button className="mt-8 px-6" disabled>
            Choose a photo
          </Button>
          <p className="mt-4 text-sm text-foreground/70">
            or drag and drop it anywhere
          </p>
        </section>
      </main>
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
