import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { CaptionControls } from './caption-controls';
import { createCaption } from '@/domain/document';
import { convertSizing } from '@/domain/sizing';
const dimensions = { width: 6000, height: 4000 };
const meta = {
  title: 'Components/UI/CaptionControls',
  component: CaptionControls,
  args: {
    caption: createCaption(),
    dimensions,
    disabled: false,
    onChange: () => {},
    onBrowseFonts: () => {},
    onBrowseColors: () => {},
    persistSections: false,
    preferenceScope: 'controls-demo-',
  },
  render: function Render(args) {
    const [caption, setCaption] = useState(args.caption);
    return (
      <div className="w-full max-w-xs">
        <CaptionControls {...args} caption={caption} onChange={setCaption} />
      </div>
    );
  },
} satisfies Meta<typeof CaptionControls>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Pixels: Story = {
  args: { caption: convertSizing(createCaption(), 'px', dimensions) },
};
export const LongEdge: Story = {
  args: { caption: convertSizing(createCaption(), 'long-edge', dimensions) },
};
export const Portrait: Story = {
  args: { dimensions: { width: 4000, height: 6000 } },
};
export const Disabled: Story = { args: { disabled: true } };

export const CompactInspector: Story = {
  args: { scope: 'local' },
};
export const CustomInspector: Story = {
  args: {
    scope: 'local',
    caption: {
      ...createCaption(),
      position: { ...createCaption().position, custom: { x: 25, y: 75 } },
    },
  },
};

export const ItalicInspector: Story = {
  args: {
    scope: 'local',
    caption: {
      ...createCaption(),
      style: { ...createCaption().style, fontStyle: 'italic', fontWeight: 700 },
    },
  },
};
export const NoItalicInspector: Story = {
  args: {
    scope: 'local',
    caption: {
      ...createCaption(),
      style: { ...createCaption().style, fontFamily: 'Advercase' },
    },
  },
};
