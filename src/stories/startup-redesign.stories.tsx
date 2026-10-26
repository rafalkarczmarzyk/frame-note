import type { Meta, StoryObj } from '@storybook/react-vite';
import App from '@/App';
import { PhotoDropOverlay } from '@/features/photo/photo-drop-overlay';

const meta = {
  title: 'Screens/StartupRedesign',
  component: App,
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, height: '800px' },
      description: {
        component:
          'Production empty editor. The empty canvas shows a photo import action, drop guidance and privacy note, with version and links at the bottom. Choose a photo or drop a JPG/PNG to enter the editor. No modal, timer or dismiss action. The app logo is passive.',
      },
    },
  },
} satisfies Meta<typeof App>;
export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyEditor: Story = {};
export const DraggingPhoto: Story = {
  decorators: [
    (Story) => (
      <>
        <Story />
        <PhotoDropOverlay />
      </>
    ),
  ],
};
export const CompactWindow: Story = {
  decorators: [
    (Story) => (
      <div className="h-[600px] max-w-[960px] overflow-hidden [&>div]:h-full">
        <Story />
      </div>
    ),
  ],
};
