import xmpPortraitUrl from '../../tests/fixtures/Agata-104.jpg';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { PhotoWorkspace } from '@/features/photo/photo-workspace';
import { loadPhoto, type LoadedPhoto } from '@/features/photo/load-photo';
import brightUrl from '../../tests/fixtures/20260405-K89A0565.jpg';
import macroUrl from '../../tests/fixtures/20261021-IMG_9959.jpg';
import heliconUrl from '../../tests/fixtures/20261020-2026-10-20 14-06-39 (A,R8,S4).jpg';
import nightUrl from '../../tests/fixtures/20210228-IMG_3200.jpg';

function TestPhotoEditor({ src, name }: { src: string; name: string }) {
  const [photo, setPhoto] = useState<LoadedPhoto | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    let loaded: LoadedPhoto | undefined;
    const abort = new AbortController();
    void (async () => {
      const response = await fetch(src, { signal: abort.signal });
      if (!response.ok) throw new Error('Could not load test photo.');
      const result = await loadPhoto(
        new File([await response.blob()], name, { type: 'image/jpeg' }),
      );
      if (!active) {
        result.dispose();
        return;
      }
      loaded = result;
      setPhoto(result);
    })().catch((cause: unknown) => {
      if (active)
        setError(
          cause instanceof Error ? cause.message : 'Could not load test photo.',
        );
    });
    return () => {
      active = false;
      abort.abort();
      loaded?.dispose();
    };
  }, [src, name]);
  return (
    <div className="flex h-svh min-h-0 flex-col overflow-hidden bg-app-base text-content-primary">
      <AppHeader>
        <div id="export-actions" />
      </AppHeader>
      {error ? (
        <p role="alert" className="p-6">
          {error}
        </p>
      ) : photo ? (
        <PhotoWorkspace photo={photo} />
      ) : (
        <p role="status" className="p-6">
          Opening test photo…
        </p>
      )}
    </div>
  );
}
const meta = {
  title: 'Screens/TestPhotos',
  component: TestPhotoEditor,
  args: { src: brightUrl, name: '20260405-K89A0565.jpg' },
  render: (args) => <TestPhotoEditor key={args.src} {...args} />,
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, height: '760px' },
      description: {
        component:
          'Original user photos in the production editor, with real EXIF fields, caption preview and JPG export. Bright Background intentionally keeps white text to expose contrast issues.',
      },
    },
  },
} satisfies Meta<typeof TestPhotoEditor>;
export default meta;
type Story = StoryObj<typeof meta>;
export const BrightBackground: Story = {};
export const Macro: Story = {
  args: { src: macroUrl, name: '20261021-IMG_9959.jpg' },
};
export const HeliconStack: Story = {
  args: { src: heliconUrl, name: '20261020-2026-10-20 14-06-39 (A,R8,S4).jpg' },
};
export const NightPortrait: Story = {
  args: { src: nightUrl, name: '20210228-IMG_3200.jpg' },
};

export const XmpPortrait: Story = {
  args: { src: xmpPortraitUrl, name: 'Agata-104.jpg' },
};
