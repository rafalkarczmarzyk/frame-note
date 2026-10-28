import type { Meta, StoryObj } from '@storybook/react-vite';
import { GraphicsPickerPanel } from './graphics-picker-panel';
import { builtinIcons } from './builtin-icons';

const meta = {
  title: 'Components/UI/GraphicsPicker',
  component: GraphicsPickerPanel,
  args: {
    icons: builtinIcons,
    images: [],
    onChooseIcon: () => {},
    onChooseGraphic: () => {},
    onUploadGraphic: () => {},
    onClose: () => {},
    className: 'h-[560px] w-80 max-h-[calc(100dvh-3rem)]',
  },
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof GraphicsPickerPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithCustomIcons: Story = {
  args: {
    icons: [...builtinIcons, { ...builtinIcons[2]!, name: 'my-camera' }],
  },
};
