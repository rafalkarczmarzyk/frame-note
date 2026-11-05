import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { createCaption } from '../../../../core/src/document';
import { defaultTiledPosition } from '../../../../core/src/tiled-watermark';
import { CaptionPositionControls } from './position-controls';
type Mode = 'anchor' | 'manual' | 'tiled';
function PositionExample({ initialMode = 'anchor' }: { initialMode?: Mode }) {
  const [caption, setCaption] = useState(() => {
    const caption = createCaption();
    if (initialMode === 'manual') caption.position.custom = { x: 50, y: 50 };
    if (initialMode === 'tiled')
      caption.position.tiled = defaultTiledPosition();
    return caption;
  });
  return (
    <div className="w-full max-w-sm bg-container-settings-base">
      <CaptionPositionControls
        caption={caption}
        onChange={setCaption}
        dimensions={{ width: 6000, height: 4000 }}
        disabled={false}
      />
    </div>
  );
}
const meta = {
  title: 'Layers/Position',
  component: PositionExample,
  parameters: {
    docs: {
      description: {
        component:
          'Production position controls: Anchor, Manual and Tiled. Tiled preserves the single-mark position and exposes Grid/Staggered, angle, spacing and offsets.',
      },
    },
  },
} satisfies Meta<typeof PositionExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Anchor: Story = { args: { initialMode: 'anchor' } };
export const Manual: Story = { args: { initialMode: 'manual' } };
export const TiledWatermark: Story = { args: { initialMode: 'tiled' } };
export const AllModes: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      {(['anchor', 'manual', 'tiled'] as const).map((mode) => (
        <PositionExample key={mode} initialMode={mode} />
      ))}
    </div>
  ),
};
