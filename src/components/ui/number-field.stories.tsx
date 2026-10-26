import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { NumberField } from './number-field';
const meta = {
  title: 'Components/UI/NumberField',
  component: NumberField,
  args: {
    label: 'Size (% short edge)',
    value: 1.35,
    min: 0.01,
    max: 20,
    onValueChange: () => {},
  },
  parameters: {
    docs: {
      description: {
        component:
          'Controlled numeric field. Keeps an editing draft for fractions and empty input; restores a valid value on blur. External values update when unfocused.',
      },
    },
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <NumberField {...args} value={value} onValueChange={setValue} />;
  },
} satisfies Meta<typeof NumberField>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Fractional: Story = {};
export const Disabled: Story = { args: { disabled: true } };

export const StepperLimits: Story = {
  args: {
    label: 'Example value',
    value: 0,
    min: 0,
    max: 0.2,
    step: 0.1,
    unit: '%',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton');
    const increase = canvas.getByRole('button', {
      name: 'Increase Example value',
    });
    const decrease = canvas.getByRole('button', {
      name: 'Decrease Example value',
    });
    await expect(decrease).toBeDisabled();
    await userEvent.click(increase);
    await expect(input).toHaveValue(0.1);
    await userEvent.click(increase);
    await expect(input).toHaveValue(0.2);
    await expect(increase).toBeDisabled();
    await userEvent.click(decrease);
    await expect(input).toHaveValue(0.1);
  },
};
