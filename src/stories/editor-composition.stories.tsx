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
import { FrameNoteLogo } from '../components/brand/frame-note-logo';

function EditorDemo() {
  const [caption, setCaption] = useState(createCaption());
  const [panel, setPanel] = useState<'tags' | 'fonts' | null>(null);
  const [quality, setQuality] = useState(95);
  return (
    <div className="flex h-[820px] min-h-0 flex-col overflow-hidden border bg-background">
      <header className="flex h-16 shrink-0 items-center justify-between bg-secondary px-5 text-secondary-foreground">
        <FrameNoteLogo className="h-7 w-auto" />
        <Button>Export JPG</Button>
      </header>
      <EditorWorkspace>
        <div className="flex min-w-0 flex-1 items-center justify-center p-6">
          <div className="flex aspect-[3/2] w-full items-center justify-center border border-foreground/20 bg-secondary text-secondary-foreground">
            <span className="font-display text-4xl">Your photo</span>
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
                        description: 'RF100mm F2.8 L MACRO IS USM',
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
              defaultOpen={false}
              persist={false}
              summary="6.10 MB"
            >
              <p className="text-xs">Example.jpg · 6000 × 4000 px</p>
            </SidebarSection>
            <SidebarSection
              id="storybook-caption"
              title="Caption"
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
  title: 'Compositions/EditorWorkspace',
  component: EditorDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The production primitives composed as a desktop editor. Panels replace content without resizing the viewport. No image decoding or export runs in Storybook. Sidebar accordion preferences use a separate story namespace.',
      },
    },
  },
} satisfies Meta<typeof EditorDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {};
