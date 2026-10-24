import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { PickerList } from './picker-list';
const meta = {
  title: 'Molecules/PickerList',
  component: PickerList,
  args: {
    items: [
      {
        id: 'exif:Artist',
        label: 'exif:Artist',
        description: 'Rafal Karczmarzyk',
      },
      {
        id: 'exif:LensModel',
        label: 'exif:LensModel',
        description: 'RF100mm F2.8 L MACRO IS USM',
      },
    ],
    onChoose: () => {},
  },
  render: function Render(args) {
    const [selected, setSelected] = useState('exif:Artist');
    return (
      <PickerList
        {...args}
        items={args.items.map((item) => ({
          ...item,
          selected: item.id === selected,
        }))}
        onChoose={setSelected}
      />
    );
  },
} satisfies Meta<typeof PickerList>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Metadata: Story = {};
export const Empty: Story = {
  args: { items: [], emptyText: 'No matching fields.' },
};
