import { expect, userEvent, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Slider } from './slider';
const meta = {
  title: 'Components/UI/Slider',
  component: Slider,
  args: {
    label: 'JPEG quality',
    value: 95,
    min: 1,
    max: 100,
    onValueChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <div className="max-w-sm">
        <p className="mb-3 text-xs">{value}%</p>
        <Slider {...args} value={value} onValueChange={setValue} />
      </div>
    );
  },
} satisfies Meta<typeof Slider>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const slider = within(canvasElement).getByRole('slider');
    slider.focus();
    await userEvent.keyboard('{Home}');
    await expect(slider).toHaveAttribute('aria-valuenow', '1');
  },
};
export const Disabled: Story = { args: { disabled: true } };
