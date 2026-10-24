import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AnchorPicker } from './anchor-picker';
const meta = {
  title: 'Molecules/AnchorPicker',
  component: AnchorPicker,
  args: { value: 'bottom-left', onValueChange: () => {} },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <AnchorPicker {...args} value={value} onValueChange={setValue} />;
  },
} satisfies Meta<typeof AnchorPicker>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
