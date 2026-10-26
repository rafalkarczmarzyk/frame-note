import { useId, useLayoutEffect, useRef } from 'react';
import { ExternalLink, LockKeyhole, X } from 'lucide-react';
import { version } from '../../../package.json';
import { FrameNoteLogo } from '@/components/brand/frame-note-logo';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';

/** Informational version of the former photo start screen. */
export function AboutSplash({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  const description = useId();
  useLayoutEffect(() => {
    const element = dialog.current;
    if (!element) return;
    element.showModal();
    return () => {
      if (element.open) element.close();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      aria-labelledby={title}
      aria-describedby={description}
      className="about-splash fixed inset-0 m-auto h-[min(720px,90svh)] max-h-[90svh] w-[min(960px,94vw)] max-w-[94vw] overflow-hidden rounded-2xl border border-panel-border bg-app-base p-0 text-content-primary shadow-panel"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose();
      }}
    >
      <div className="relative isolate flex h-full min-h-0 flex-col overflow-y-auto">
        <img
          src="/images/start-screen-bird.jpg"
          alt=""
          width={2560}
          height={1707}
          className="pointer-events-none absolute inset-0 -z-20 size-full object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-app-base opacity-60" />
        <header className="flex shrink-0 items-center justify-between gap-4 px-5 py-4 sm:px-8 sm:py-6">
          <FrameNoteLogo className="h-7 w-auto" />
          <IconButton label="Close about FrameNote" onClick={onClose} autoFocus>
            <X aria-hidden="true" />
          </IconButton>
        </header>
        <section className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
          <h1
            id={title}
            className="font-display text-4xl font-normal tracking-tight sm:text-6xl"
          >
            Leave your mark.
          </h1>
          <p id={description} className="mt-4 max-w-md text-sm leading-6">
            Add a watermark, logo, or photo details.
          </p>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs">
            <LockKeyhole className="size-3.5" aria-hidden="true" />
            Photos stay on your device.
          </p>
          <Button className="mt-7" onClick={onClose}>
            Back to editor
          </Button>
        </section>
        <footer className="mx-auto mb-5 flex max-w-full shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-xl bg-header-base px-5 py-3 text-xs">
          <span>© {new Date().getFullYear()} FrameNote</span>
          <span>v{version}</span>
          <a
            href="https://github.com/rafalkarczmarzyk/frame-note"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-focus-ring"
          >
            GitHub
            <ExternalLink className="size-3" aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a
            href="https://github.com/rafalkarczmarzyk/frame-note/blob/master/CHANGELOG.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-focus-ring"
          >
            Changelog
            <ExternalLink className="size-3" aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </footer>
      </div>
    </dialog>
  );
}
