import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { PickerList } from './picker-list';
const meta = {
  title: 'Components/UI/PickerList',
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

export const ContainerSelection: Story = {
  args: { selectionTone: 'container', selectedLabel: '' },
};

export const ReorderLayers: Story = {
  render: function ReorderLayers() {
    const [items, setItems] = useState([
      { id: 'signature', label: 'Signature', selected: true },
      { id: 'camera', label: 'Camera details' },
      { id: 'author', label: 'Author' },
    ]);
    return (
      <div className="max-w-sm">
        <PickerList
          items={items}
          selectionTone="container"
          selectedLabel=""
          onChoose={(id) =>
            setItems((items) =>
              items.map((item) => ({ ...item, selected: item.id === id })),
            )
          }
          onMove={(id, index) =>
            setItems((items) => {
              const result = [...items];
              const current = result.findIndex((item) => item.id === id);
              const [item] = result.splice(current, 1);
              result.splice(index, 0, item!);
              return result;
            })
          }
        />
      </div>
    );
  },
};
