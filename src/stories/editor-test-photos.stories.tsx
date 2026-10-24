import { brandIcons } from '@/features/caption/brand-icons';
import { Aperture, Camera } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { SvgIcon } from '@/features/caption/svg-icons';
import wildlifeUrl from '../../tests/fixtures/20260520-IMG_3843.jpg';
import portraitUrl from '../../tests/fixtures/20261021-IMG_0469.jpg';
import { createCaption } from '@/domain/document';
import {
  createCaptionLayout,
  addCaption,
  addLogo,
  type CaptionLayout,
} from '@/domain/caption-layout';
import xmpPortraitUrl from '../../tests/fixtures/Agata-104.jpg';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState, type ReactNode } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { PhotoWorkspace } from '@/features/photo/photo-workspace';
import { loadPhoto, type LoadedPhoto } from '@/features/photo/load-photo';
import brightUrl from '../../tests/fixtures/20260405-K89A0565.jpg';
import macroUrl from '../../tests/fixtures/20261021-IMG_9959.jpg';
import heliconUrl from '../../tests/fixtures/20261020-2026-10-20 14-06-39 (A,R8,S4).jpg';
import nightUrl from '../../tests/fixtures/20210228-IMG_3200.jpg';

function TestPhotoEditor({
  src,
  name,
  initialLayout,
  initialIcons,
  toolbar,
}: {
  src: string;
  name: string;
  initialLayout?: CaptionLayout;
  initialIcons?: SvgIcon[];
  toolbar?: ReactNode;
}) {
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
      {toolbar}
      {error ? (
        <p role="alert" className="p-6">
          {error}
        </p>
      ) : photo ? (
        <PhotoWorkspace
          photo={photo}
          initialLayout={initialLayout}
          initialIcons={initialIcons}
        />
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

const multipleLayout = addCaption(
  addCaption(
    createCaptionLayout({ ...createCaption(), template: '{author}' }),
    'technical',
  ),
  'title',
);
multipleLayout.containers[1]!.template = '{exposure}';
multipleLayout.containers[1]!.position.anchor = 'bottom-right';
multipleLayout.containers[2]!.template = 'A closer look';
multipleLayout.containers[2]!.position.anchor = 'top-center';
multipleLayout.containers[2]!.style.fontFamily = 'Advercase';
multipleLayout.containers[2]!.style.fontSize = 4;

export const MultipleCaptions: Story = {
  args: {
    src: macroUrl,
    name: '20261021-IMG_9959.jpg',
    initialLayout: multipleLayout,
  },
};

const testPhotos = [
  { src: wildlifeUrl, name: '20260520-IMG_3843.jpg', label: 'Wildlife' },
  {
    src: portraitUrl,
    name: '20261021-IMG_0469.jpg',
    label: 'Wildlife portrait',
  },
  { src: brightUrl, name: '20260405-K89A0565.jpg', label: 'Bright background' },
  { src: macroUrl, name: '20261021-IMG_9959.jpg', label: 'Macro' },
  {
    src: heliconUrl,
    name: '20261020-2026-10-20 14-06-39 (A,R8,S4).jpg',
    label: 'Helicon stack',
  },
  { src: nightUrl, name: '20210228-IMG_3200.jpg', label: 'Night portrait' },
  { src: xmpPortraitUrl, name: 'Agata-104.jpg', label: 'XMP portrait' },
];

function AllTestPhotos() {
  const [selected, setSelected] = useState(testPhotos[0]!);
  return (
    <TestPhotoEditor
      key={selected.src}
      {...selected}
      toolbar={
        <nav
          aria-label="Test photos"
          className="flex shrink-0 gap-2 overflow-x-auto bg-sidebar-base p-3"
        >
          {testPhotos.map((photo) => (
            <button
              key={photo.src}
              type="button"
              aria-pressed={selected.src === photo.src}
              onClick={() => setSelected(photo)}
              title={photo.name}
              className="control-button control-neutral flex w-28 shrink-0 flex-col gap-1 p-2 text-xs aria-pressed:outline-2 aria-pressed:outline-input-focus-ring"
            >
              <img
                src={photo.src}
                alt=""
                className="h-16 w-full rounded object-contain"
              />
              <span>{photo.label}</span>
            </button>
          ))}
        </nav>
      }
    />
  );
}

export const AllPhotos: Story = {
  render: () => <AllTestPhotos />,
  parameters: {
    docs: {
      description: {
        story:
          'All seven original test photos. Select a thumbnail to open it in the real editor. Switching photos starts a fresh editor session.',
      },
    },
  },
};

const customLayout = structuredClone(multipleLayout);
customLayout.containers[2]!.position.custom = { x: 65, y: 22 };
export const CustomPosition: Story = {
  args: {
    src: macroUrl,
    name: '20261021-IMG_9959.jpg',
    initialLayout: customLayout,
  },
};

const inlineIcons: SvgIcon[] = [
  { name: 'aperture', svg: renderToStaticMarkup(<Aperture />), aspect: 1 },
  { name: 'camera', svg: renderToStaticMarkup(<Camera />), aspect: 1 },
];
const inlineLayoutExample = createCaptionLayout({
  ...createCaption(),
  template: '{icon:aperture} {aperture}   {icon:camera} {camera}\n{author}',
});
export const InlineIcons: Story = {
  args: {
    src: macroUrl,
    name: '20261021-IMG_9959.jpg',
    initialLayout: inlineLayoutExample,
    initialIcons: inlineIcons,
  },
};

const standaloneLogoLayout = addLogo(
  createCaptionLayout({ ...createCaption(), template: '{author}' }),
  'logo-demo',
  { ...brandIcons[0]!, name: 'FrameNote.svg' },
  { width: 3908, height: 2605 },
);
standaloneLogoLayout.containers[1]!.logo!.colorMode = 'single';
standaloneLogoLayout.containers[1]!.logo!.width = 25;
export const StandaloneLogo: Story = {
  args: {
    src: macroUrl,
    name: '20261021-IMG_9959.jpg',
    initialLayout: standaloneLogoLayout,
  },
};
