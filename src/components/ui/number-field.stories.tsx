import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
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
