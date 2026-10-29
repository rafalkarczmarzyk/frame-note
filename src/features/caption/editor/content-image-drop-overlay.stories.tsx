import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InspectorSection } from '@/components/layout/inspector-section';
import { CaptionEditor } from './caption-editor';
import { ContentImageDropOverlay } from './content-image-drop-overlay';
import type { ImageAsset } from '@/domain/inline-image';
import { builtinIcons } from '../builtin-icons';
const noop = () => {};
function ContentDropPreview({
  overlay = false,
  width = 360,
}: {
  overlay?: boolean;
  width?: number;
}) {
  const [value, setValue] = useState('Before After');
  const [images, setImages] = useState<ImageAsset[]>([]);
  return (
    <div
      style={{ width }}
      className="max-w-full bg-sidebar-base text-content-primary"
    >
      <InspectorSection title="Content" imageDrop>
        <CaptionEditor
          value={value}
          images={images}
          fields={[]}
          icons={builtinIcons}
          onChange={(next, assets) => {
            setValue(next);
            if (assets) setImages(assets);
          }}
          onFocus={noop}
          onBlur={noop}
          onReady={noop}
        />
        {overlay && <ContentImageDropOverlay />}
      </InspectorSection>
    </div>
  );
}
const meta = {
  title: 'Pickers/ContentImageDrop',
  component: ContentDropPreview,
  parameters: {
    docs: {
      description: {
        component:
          'Production Content drop target. Place the text caret, then drop one SVG or PNG anywhere in this section. The picker and drop share validation, asset retention, insertion and cancellation. Dragging within the section preserves the selection; leaving, Escape, blur and drop dismiss the overlay. The application routes canvas drops to the photo and Content drops to the active layer.',
      },
    },
  },
} satisfies Meta<typeof ContentDropPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {};
export const Overlay: Story = { args: { overlay: true } };
export const Narrow: Story = { args: { overlay: true, width: 280 } };
