import { FloatingPanel } from '@/components/layout/floating-panel';
import { CategoryFilter } from '@/components/ui/category-filter';
import { fontCategories } from '@/domain/fonts';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Input } from '@/components/ui/input';
import { FontPicker } from './font-picker';
const meta = {
  title: 'Components/UI/FontPicker',
  component: FontPicker,
  args: { value: 'Montserrat Variable', query: '', onChoose: () => {} },
  render: function Interactive(args) {
    const [category, setCategory] = useState(args.category ?? 'all');
    const [value, setValue] = useState(args.value);
    const [query, setQuery] = useState(args.query);
    return (
      <FloatingPanel
        title="Choose a font"
        onClose={() => {}}
        className="h-[600px] max-h-[80dvh] w-72"
        toolbar={
          <>
            <Input
              aria-label="Search fonts"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <CategoryFilter
              label="Font categories"
              className="mt-2 -mb-3"
              categories={fontCategories.map((value) => ({
                value,
                label: value,
              }))}
              value={category}
              onValueChange={setCategory}
            />
          </>
        }
        footer={<output aria-label="Selected font">{value}</output>}
      >
        <FontPicker
          {...args}
          category={category}
          value={value}
          query={query}
          onChoose={setValue}
        />
      </FloatingPanel>
    );
  },
} satisfies Meta<typeof FontPicker>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { query: 'no such family' } };
export const Prata: Story = {
  args: { query: 'Prata', value: 'Prata' },
};
export const Monospace: Story = { args: { category: 'Monospace' } };
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-56 [&>aside]:w-full">
        <Story />
      </div>
    ),
  ],
};
export const Unselected: Story = { args: { value: '' } };
export const SearchAndCategories: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('radio', { name: 'Serif' }));
    await userEvent.type(c.getByRole('textbox'), 'Lora');
    await userEvent.click(c.getByRole('button', { name: /Lora/ }));
    await expect(c.getByLabelText('Selected font')).toHaveTextContent('Lora');
    await userEvent.click(c.getByRole('radio', { name: 'Monospace' }));
    await expect(c.getByText('No matching fonts.')).toBeVisible();
    await expect(c.getByLabelText('Selected font')).toHaveTextContent('Lora');
    await userEvent.clear(c.getByRole('textbox'));
    await expect(
      c.getByRole('button', { name: /JetBrains Mono/ }),
    ).toBeVisible();
  },
};
