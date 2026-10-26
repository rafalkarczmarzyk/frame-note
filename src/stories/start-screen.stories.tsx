import type { Meta, StoryObj } from '@storybook/react-vite';
import { StartScreen } from '../features/photo/start-screen';
import { PhotoDropOverlay } from '../features/photo/photo-drop-overlay';

function StartScreenComposition({ isDragging = false, loading = false }) {
  return (
    <div className="relative isolate flex h-full flex-col overflow-hidden bg-app-base text-content-primary">
      <StartScreen loading={loading} onChoosePhoto={() => {}} />
      {isDragging && <PhotoDropOverlay />}
    </div>
  );
}

const meta = {
  title: 'Screens/StartScreen',
  component: StartScreenComposition,
  args: { isDragging: false, loading: false },
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, height: '720px' },
      description: {
        component:
          'The production start screen with its overlaid logo and drop overlay. Use the viewport toolbar to preview responsive styling. The drag state stays visible without dragging a file; photo selection is inactive in this styling preview.',
      },
    },
  },
} satisfies Meta<typeof StartScreenComposition>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const DraggingPhoto: Story = {
  args: { isDragging: true },
};
export const Loading: Story = {
  args: { loading: true },
};
