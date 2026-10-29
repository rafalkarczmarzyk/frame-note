import { expect, userEvent, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Select } from './select';
const meta = {
  title: 'Fields/Select',
  component: Select,
  args: {
    'aria-label': 'Weight',
    value: '400',
    onValueChange: () => {},
    options: [
      { value: '400', label: 'Regular' },
      { value: '700', label: 'Bold' },
      { value: '900', label: 'Unavailable', disabled: true },
    ],
  },
  parameters: {
    docs: {
      description: {
        component:
          'Custom Radix select: portal, keyboard navigation, selected indicator and disabled options. Same primitive is used in the application.',
      },
    },
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <Select {...args} value={value} onValueChange={setValue} />;
  },
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox'));
    await userEvent.click(
      within(document.body).getByRole('option', { name: /^Bold$/ }),
    );
    await expect(canvas.getByRole('combobox')).toHaveTextContent('Bold');
  },
};
export const Disabled: Story = { args: { disabled: true } };

export const PresetGroups: Story = {
  args: {
    'aria-label': 'Saved preset',
    value: 'default',
    options: [
      { value: 'default', label: 'Default' },
      { value: 'signature', label: 'Signature' },
      { value: 'long-exposure', label: 'Long Exposure' },
      { value: 'my-preset', label: 'My preset', separatorBefore: true },
      { value: 'my-signature', label: 'My signature' },
    ],
  },
};
