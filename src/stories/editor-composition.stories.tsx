import { Download, TextQuote } from 'lucide-react';
import { PhotoIcon } from '../components/icons/photo-icon';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  EditorWorkspace,
  ToolSidebar,
} from '../components/layout/editor-workspace';
import { FloatingPanel } from '../components/layout/floating-panel';
import { SidebarSection } from '../components/layout/sidebar-section';
import { CaptionControls } from '../features/caption/caption-controls';
import { createCaption } from '../domain/document';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { PickerList } from '../components/ui/picker-list';
import { Slider } from '../components/ui/slider';
import { SegmentedControl } from '../components/ui/segmented-control';
import { AppHeader } from '../components/layout/app-header';
import testPhotoUrl from '../../tests/fixtures/20260520-IMG_3843.jpg';
import portraitPhotoUrl from '../../tests/fixtures/20261021-IMG_0469.jpg';

const photos = {
  landscape: {
    url: testPhotoUrl,
    name: '20260520-IMG_3843.jpg',
    width: 5964,
    height: 3976,
    lens: 'RF100-500mm F4.5-7.1 L IS USM + EXTENDER RF1.4x',
  },
  portrait: {
    url: portraitPhotoUrl,
    name: '20261021-IMG_0469.jpg',
    width: 4000,
    height: 6000,
    lens: 'RF200-800mm F6.3-9 IS USM + EXTENDER RF1.4x',
  },
};

function EditorDemo({
  orientation = 'landscape',
}: {
  orientation?: keyof typeof photos;
}) {
  const photo = photos[orientation];
  const [caption, setCaption] = useState(createCaption());
  const [panel, setPanel] = useState<'tags' | 'fonts' | null>(null);
  const [quality, setQuality] = useState(95);
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-app-base text-content-primary">
      <AppHeader>
        <Button>Export JPG</Button>
      </AppHeader>
      <EditorWorkspace>
        <div className="relative min-h-0 min-w-0 flex-1 bg-workspace-base">
          <div className="absolute inset-6">
            <img
              src={photo.url}
              alt="Test photo by Rafal Karczmarzyk"
              width={photo.width}
              height={photo.height}
              className="h-full w-full object-contain"
            />
          </div>
        </div>
        {panel && (
          <FloatingPanel
            title={panel === 'tags' ? 'Available tags' : 'Choose a font'}
            onClose={() => setPanel(null)}
            className="absolute inset-y-4 right-[calc(var(--tools-sidebar-width)+1rem)] z-20 w-72"
            toolbar={<Input aria-label="Search panel" placeholder="Search…" />}
          >
            <PickerList
              items={
                panel === 'tags'
                  ? [
                      {
                        id: 'exif:Artist',
                        label: 'exif:Artist',
                        description: 'Rafal Karczmarzyk',
                        selected: caption.template.includes('{exif:Artist}'),
                      },
                      {
                        id: 'exif:LensModel',
                        label: 'exif:LensModel',
                        description: photo.lens,
                      },
                    ]
                  : [
                      {
                        id: 'Montserrat Variable',
                        label: 'Montserrat',
                        preview: (
                          <span className="font-sans text-xl">
                            Every frame has a story.
                          </span>
                        ),
                      },
                      {
                        id: 'Advercase',
                        label: 'Advercase',
                        preview: (
                          <span className="font-display text-2xl">
                            Every frame has a story.
                          </span>
                        ),
                      },
                    ]
              }
              onChoose={(id) =>
                panel === 'tags'
                  ? setCaption((value) => ({
                      ...value,
                      template: value.template + `{${id}}`,
                    }))
                  : setCaption((value) => ({
                      ...value,
                      style: {
                        ...value.style,
                        fontFamily: id as typeof value.style.fontFamily,
                      },
                    }))
              }
            />
          </FloatingPanel>
        )}
        <ToolSidebar>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <SidebarSection
              id="storybook-photo"
              title="Photo"
              icon={<PhotoIcon />}
              defaultOpen={false}
              persist={false}
              summary="6.10 MB"
            >
              <p className="text-xs">
                {photo.name} · {photo.width} × {photo.height} px
              </p>
            </SidebarSection>
            <SidebarSection
              id="storybook-caption"
              title="Caption"
              icon={<TextQuote />}
              persist={false}
            >
              <Textarea
                aria-label="Caption"
                rows={4}
                value={caption.template}
                onChange={(event) =>
                  setCaption((value) => ({
                    ...value,
                    template: event.target.value,
                  }))
                }
              />
              <Button
                variant="outline"
                className="mt-3 w-full"
                onClick={() =>
                  setPanel((value) => (value === 'tags' ? null : 'tags'))
                }
              >
                Browse available tags
              </Button>
            </SidebarSection>
            <CaptionControls
              dimensions={{ width: photo.width, height: photo.height }}
              caption={caption}
              preferenceScope="storybook-"
              persistSections={false}
              onChange={setCaption}
              disabled={false}
              onBrowseFonts={() => setPanel('fonts')}
            />
            <SidebarSection
              id="storybook-export"
              title="Export"
              icon={<Download />}
              persist={false}
              summary="Best · 4.2 MB"
            >
              <div className="space-y-3">
                <SegmentedControl
                  label="Quality preset"
                  value={String(quality)}
                  onValueChange={(value) => setQuality(Number(value))}
                  options={[
                    { value: '60', label: 'Small' },
                    { value: '75', label: 'Balanced' },
                    { value: '95', label: 'Best' },
                  ]}
                />
                <Slider
                  label="JPEG quality"
                  min={1}
                  value={quality}
                  onValueChange={setQuality}
                />
              </div>
            </SidebarSection>
          </div>
        </ToolSidebar>
      </EditorWorkspace>
    </div>
  );
}
const meta = {
  title: 'Screens/EditorWorkspace',
  component: EditorDemo,
  args: { orientation: 'landscape' },
  argTypes: {
    orientation: { control: 'radio', options: ['landscape', 'portrait'] },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, height: '720px' },
      description: {
        component:
          'The production primitives composed as a desktop editor. Panels replace content without resizing the viewport. The selected original test photo is displayed without caption rendering or JPEG export. Sidebar accordion preferences use a separate story namespace.',
      },
    },
  },
} satisfies Meta<typeof EditorDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {};

export const Portrait: Story = {
  args: { orientation: 'portrait' },
};
