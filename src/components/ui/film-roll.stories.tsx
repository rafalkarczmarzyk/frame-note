import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilmRoll, type FilmRollPhoto, type FilmRollProps } from './film-roll';
import wildlifeUrl from '../../../tests/fixtures/20260520-IMG_3843.jpg';
import portraitUrl from '../../../tests/fixtures/20261021-IMG_0469.jpg';
import brightUrl from '../../../tests/fixtures/20260405-K89A0565.jpg';
import macroUrl from '../../../tests/fixtures/20261021-IMG_9959.jpg';
import nightUrl from '../../../tests/fixtures/20210228-IMG_3200.jpg';

const photos: FilmRollPhoto[] = [
  { id: 'wildlife', src: wildlifeUrl, name: '20260520-IMG_3843.jpg' },
  { id: 'portrait', src: portraitUrl, name: '20261021-IMG_0469.jpg' },
  { id: 'bright', src: brightUrl, name: '20260405-K89A0565.jpg' },
  { id: 'macro', src: macroUrl, name: '20261021-IMG_9959.jpg' },
  { id: 'night', src: nightUrl, name: '20210228-IMG_3200.jpg' },
];

function InteractiveRoll(args: FilmRollProps) {
  const [activeId, setActiveId] = useState(args.activePhotoId);
  const active = args.photos.find((photo) => photo.id === activeId);
  return (
    <div className="min-w-0 space-y-3">
      <FilmRoll
        {...args}
        activePhotoId={activeId}
        onSelectPhoto={setActiveId}
      />
      <p className="text-xs text-content-secondary" role="status">
        {active ? `Selected: ${active.name}` : 'Select a photo'}
      </p>
    </div>
  );
}

const meta = {
  title: 'Components/UI/FilmRoll',
  component: FilmRoll,
  args: { photos, activePhotoId: 'wildlife', height: 195 },
  argTypes: {
    height: { control: { type: 'range', min: 78, max: 312, step: 1 } },
    photos: { control: false },
    onSelectPhoto: { control: false },
  },
  render: (args) => <InteractiveRoll {...args} />,
} satisfies Meta<typeof FilmRoll>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Compact: Story = { args: { height: 156 } };
export const TwoPhotos: Story = { args: { photos: photos.slice(0, 2) } };
export const LongRoll: Story = {
  args: {
    photos: Array.from({ length: 5 }, (_, group) =>
      photos.map((photo, index) => ({
        ...photo,
        id: `photo-${group * photos.length + index}`,
      })),
    )
      .flat()
      .slice(0, 24),
    activePhotoId: 'photo-0',
  },
};
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-[360px] max-w-full">
        <Story />
      </div>
    ),
  ],
};
export const DifferentProportions: Story = {
  args: {
    photos: photos.filter((photo) => photo.id !== 'macro'),
    activePhotoId: 'portrait',
  },
};
export const BelowCanvas: Story = {
  render: function BelowCanvas(args) {
    const [activeId, setActiveId] = useState('wildlife');
    const active = args.photos.find((photo) => photo.id === activeId);
    return (
      <div className="flex h-[640px] max-h-[85dvh] min-h-0 flex-col bg-workspace-base">
        <div className="flex min-h-0 flex-1 items-center justify-center p-6">
          <img
            src={active?.src}
            alt={active?.name}
            className="block max-h-full max-w-full object-contain"
          />
        </div>
        <FilmRoll
          {...args}
          className="shrink-0"
          activePhotoId={activeId}
          onSelectPhoto={setActiveId}
        />
      </div>
    );
  },
};
