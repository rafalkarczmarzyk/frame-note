import { FrameNoteIcon } from '@/components/brand/frame-note-icon';
import { Button } from '@/components/ui/button';

export function StartScreen({
  loading = false,
  onChoosePhoto,
}: {
  loading?: boolean;
  onChoosePhoto: () => void;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <section className="text-center" aria-labelledby="upload-title">
        <FrameNoteIcon
          width={64}
          height={64}
          className="mx-auto mb-8"
          aria-hidden="true"
          focusable="false"
        />
        <h1
          id="upload-title"
          className="font-display text-4xl font-normal tracking-tight sm:text-5xl"
        >
          Every frame has a story.
        </h1>
        <Button
          className="mt-8 px-6"
          disabled={loading}
          onClick={onChoosePhoto}
        >
          Choose a photo
        </Button>
        <p className="mt-4 text-sm text-foreground/70">
          or drag and drop it anywhere
        </p>
      </section>
    </main>
  );
}
