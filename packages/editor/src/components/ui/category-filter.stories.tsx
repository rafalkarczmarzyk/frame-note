import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { CategoryFilter } from './category-filter';

const meta = {
  title: 'Selection & feedback/CategoryFilter',
  component: CategoryFilter,
  args: {
    categories: [
      { value: 'sans', label: 'Sans-serif' },
      { value: 'serif', label: 'Serif' },
      { value: 'mono', label: 'Monospace' },
    ],
    value: 'all',
    onValueChange: () => {},
  },
  render: function Interactive(args) {
    const [value, setValue] = useState(args.value);
    return <CategoryFilter {...args} value={value} onValueChange={setValue} />;
  },
} satisfies Meta<typeof CategoryFilter>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Selected: Story = { args: { value: 'serif' } };
export const LongLabelsAndOverflow: Story = {
  args: {
    categories: [
      { value: 'long', label: 'A category with a very long descriptive label' },
      ...meta.args.categories,
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-44">
        <Story />
      </div>
    ),
  ],
};
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const all = canvas.getByRole('radio', { name: 'All' });
    all.focus();
    await userEvent.keyboard('{ArrowRight} ');
    await expect(
      canvas.getByRole('radio', { name: 'Sans-serif' }),
    ).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(all);
    await expect(all).toHaveAttribute('aria-checked', 'true');
  },
};
