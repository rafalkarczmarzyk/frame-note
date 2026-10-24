import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { SegmentedControl } from './segmented-control';
const meta = {
  title: 'Components/UI/SegmentedControl',
  component: SegmentedControl,
  args: {
    label: 'JPEG quality presets',
    value: '95',
    onValueChange: () => {},
    options: [
      { value: '60', label: 'Small' },
      { value: '75', label: 'Balanced' },
      { value: '95', label: 'Best' },
    ],
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <div className="max-w-xs">
        <SegmentedControl {...args} value={value} onValueChange={setValue} />
      </div>
    );
  },
} satisfies Meta<typeof SegmentedControl>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Quality: Story = {};
export const Icons: Story = {
  args: {
    label: 'Text align',
    value: 'left',
    options: [
      { value: 'left', label: 'Align left', content: <AlignLeft /> },
      { value: 'center', label: 'Align center', content: <AlignCenter /> },
      { value: 'right', label: 'Align right', content: <AlignRight /> },
    ],
  },
};
export const Disabled: Story = { args: { disabled: true } };
