import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { MarginEditor } from './margin-editor';
const meta = {
  title: 'Components/UI/MarginEditor',
  component: MarginEditor,
  args: {
    value: { top: 3, right: 3, bottom: 3, left: 3 },
    linkMode: 'none',
    unit: 'short-edge',
    unitLabel: '% S',
    dimensions: { width: 6000, height: 4000 },
    onChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    const [linkMode, setLinkMode] = useState(args.linkMode);
    return (
      <div className="w-full max-w-[280px]">
        <MarginEditor
          {...args}
          value={value}
          linkMode={linkMode}
          onChange={(next, nextLinked) => {
            setValue(next);
            setLinkMode(nextLinked);
          }}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        component:
          'Four independent edges using one document unit. None edits edges independently; Pairs links top/bottom and left/right; All links all edges. Unlinking preserves values. Hover or focus highlights the affected edge. Limits retain at least one source pixel inside the image.',
      },
    },
  },
} satisfies Meta<typeof MarginEditor>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Linked: Story = { args: { linkMode: 'all' } };
export const Pairs: Story = {
  args: { linkMode: 'pairs', value: { top: 2, bottom: 2, left: 4, right: 4 } },
};
export const Asymmetric: Story = {
  args: { value: { top: 2, right: 4, bottom: 6, left: 8 } },
};
export const Pixels: Story = {
  args: {
    unit: 'px',
    unitLabel: 'px',
    value: { top: 120, right: 120, bottom: 120, left: 120 },
  },
};
export const Disabled: Story = { args: { disabled: true } };
