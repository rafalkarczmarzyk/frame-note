import { FloatingPanel } from '@/components/layout/floating-panel';
import { CategoryFilter } from '@/components/ui/category-filter';
import { metadataGroups } from '@/domain/caption-tags';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Input } from '@/components/ui/input';
import { createMetadataField } from '@/domain/metadata';
import { MetadataPicker } from './metadata-picker';
const meta = {
  title: 'Pickers/MetadataPicker',
  component: MetadataPicker,
  args: {
    fields: [
      createMetadataField({
        group: 'exif',
        name: 'Artist',
        displayValue: 'Anna',
        rawValue: 'Anna',
      }),
      createMetadataField({
        group: 'xmp',
        name: 'Title',
        displayValue: 'Sunset',
        rawValue: 'Sunset',
      }),
    ],
    query: '',
    used: new Set<string>(),
    onChoose: () => {},
  },
  render: function Interactive(args) {
    const [category, setCategory] = useState(args.category ?? 'all');
    const [used, setUsed] = useState(args.used);
    const [query, setQuery] = useState(args.query);
    return (
      <FloatingPanel
        title="Available tags"
        onClose={() => {}}
        className="h-[600px] max-h-[80dvh] w-72"
        toolbar={
          <>
            <Input
              aria-label="Search tags"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <CategoryFilter
              label="Tag categories"
              className="mt-2"
              categories={metadataGroups(args.fields, '').map((g) => ({
                value: g.name,
                label: g.name === 'FrameNote' ? g.name : g.name.toUpperCase(),
              }))}
              value={category}
              onValueChange={setCategory}
            />
          </>
        }
      >
        <MetadataPicker
          {...args}
          category={category}
          query={query}
          used={used}
          onChoose={(key) => setUsed(new Set([...used, key]))}
        />
      </FloatingPanel>
    );
  },
} satisfies Meta<typeof MetadataPicker>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Used: Story = {
  args: { used: new Set(['author', 'exif:Artist']) },
};
export const Empty: Story = { args: { query: 'nothing matches this' } };
export const MissingPhotoData: Story = { args: { fields: [] } };
export const SearchAndCategories: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('radio', { name: 'EXIF' }));
    await userEvent.click(c.getByRole('button', { name: /exif:Artist/ }));
    await userEvent.click(c.getByRole('radio', { name: 'FrameNote' }));
    await userEvent.type(c.getByRole('textbox'), 'Sunset');
    await expect(c.getByText('No matching metadata.')).toBeVisible();
    await userEvent.clear(c.getByRole('textbox'));
    await userEvent.click(c.getByRole('radio', { name: 'EXIF' }));
    await expect(
      c.getByRole('button', { name: /exif:Artist/ }),
    ).toHaveAttribute('aria-pressed', 'true');
  },
};
