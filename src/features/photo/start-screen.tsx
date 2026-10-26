import { version } from '../../../package.json';
import { ExternalLink, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FrameNoteLogo } from '@/components/brand/frame-note-logo';

export function StartScreen({
  loading = false,
  onChoosePhoto,
}: {
  loading?: boolean;
  onChoosePhoto: () => void;
}) {
  return (
    <main className="start-screen relative isolate flex min-h-0 flex-1 flex-col overflow-y-auto text-center text-start-screen-text">
      <img
        src="/images/start-screen-bird.jpg"
        alt=""
        fetchPriority="high"
        width={2560}
        height={1707}
        className="pointer-events-none absolute inset-0 -z-20 size-full object-cover object-center"
      />
      <div className="start-screen-gradient pointer-events-none absolute inset-0 -z-10" />
      <a
        href="/"
        aria-label="FrameNote home"
        className="absolute top-4 left-6 z-10 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus-ring sm:top-6 sm:left-10"
      >
        <FrameNoteLogo className="h-6 w-auto text-current sm:h-8" />
      </a>
      <section
        className="start-screen-content flex shrink-0 flex-col items-center justify-center px-6"
        aria-labelledby="upload-title"
      >
        <h1
          id="upload-title"
          className="start-screen-title font-display font-normal tracking-tight"
        >
          Leave your mark.
        </h1>
        <p className="start-screen-description">
          Add a watermark, logo, or photo details.
        </p>
        <Button
          className="start-screen-choose px-6"
          disabled={loading}
          onClick={onChoosePhoto}
        >
          Choose a photo
        </Button>
        <p className="start-screen-drop text-xs">
          or drop a JPG or PNG anywhere
        </p>
        <p className="start-screen-privacy flex items-center justify-center gap-1.5 text-[11px]">
          <LockKeyhole className="size-3" aria-hidden="true" />
          Photos stay on your device.
        </p>
      </section>
      <footer className="start-screen-footer mt-auto mb-4 flex w-fit shrink-0 flex-wrap items-center justify-center gap-x-2 gap-y-1 self-center rounded-xl px-4 py-3 text-xs">
        <span className="whitespace-nowrap">
          © {new Date().getFullYear()} FrameNote
        </span>
        <span aria-hidden="true">·</span>
        <a
          href="https://github.com/rafalkarczmarzyk/frame-note"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`FrameNote v${version} on GitHub (opens in a new tab)`}
          className="inline-flex items-center gap-1 rounded-sm whitespace-nowrap hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus-ring"
        >
          v{version} <ExternalLink className="size-3" aria-hidden="true" />
        </a>
        <span aria-hidden="true">·</span>
        <a
          href="https://github.com/rafalkarczmarzyk/frame-note/blob/master/CHANGELOG.md"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Changelog (opens in a new tab)"
          className="inline-flex items-center gap-1 rounded-sm whitespace-nowrap hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus-ring"
        >
          Changelog <ExternalLink className="size-3" aria-hidden="true" />
        </a>
      </footer>
    </main>
  );
}
