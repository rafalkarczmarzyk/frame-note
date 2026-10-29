import { Button } from './button';
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
  title: 'Photo session/FilmRoll',
  component: FilmRoll,
  args: { photos, activePhotoId: 'wildlife', height: 180 },
  argTypes: {
    height: { control: { type: 'range', min: 78, max: 312, step: 1 } },
    variant: {
      control: 'select',
      options: ['emerald', 'gold', 'ivory', 'coral'],
    },
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

export const Emerald: Story = { args: { variant: 'emerald' } };
export const Gold: Story = { args: { variant: 'gold' } };
export const Ivory: Story = { args: { variant: 'ivory' } };
export const Coral: Story = { args: { variant: 'coral' } };
export const ColorVariants: Story = {
  render: (args) => (
    <div className="space-y-7">
      {(['emerald', 'gold', 'ivory', 'coral'] as const).map((variant) => (
        <InteractiveRoll key={variant} {...args} variant={variant} />
      ))}
    </div>
  ),
};
export const ChangingCount: Story = {
  render: function ChangingCount(args) {
    const [count, setCount] = useState(2);
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCount(count + 1)}
            disabled={count === photos.length}
          >
            Add photo
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCount(count - 1)}
            disabled={count === 0}
          >
            Remove photo
          </Button>
        </div>
        <InteractiveRoll {...args} photos={photos.slice(0, count)} />
      </div>
    );
  },
};

export const PullShortRoll: Story = {
  args: { photos: photos.slice(0, 2) },
  parameters: {
    docs: {
      description: {
        story:
          'Drag the film tail to the right and release: a short roll can be pulled freely across the available space and returns to its starting position. Drag any frame or the tail; click to select a photo.',
      },
    },
  },
};
export const FixedCassette: Story = {
  ...LongRoll,
  decorators: [
    (Story) => (
      <div className="w-[720px] max-w-full">
        <Story />
      </div>
    ),
  ],
};

export const DragAnywhere: Story = {
  args: { photos: photos.slice(0, 3) },
  parameters: {
    docs: {
      description: {
        story:
          'Drag any photo or the perforations. A short click selects; dragging preserves selection. The dark film sits on a dedicated sidebar-colored tray.',
      },
    },
  },
};

export const CassetteProportions: Story = {
  render: (args) => (
    <div className="space-y-6">
      {[
        { scale: 1, label: 'Original · 100%' },
        { scale: 0.9, label: 'Compact · 90% — recommended' },
        { scale: 0.85, label: 'Small · 85%' },
      ].map(({ scale, label }) => (
        <section key={scale} className="space-y-2">
          <h2 className="text-sm font-medium text-content-primary">{label}</h2>
          <InteractiveRoll
            {...args}
            photos={photos.slice(0, 3)}
            cassetteScale={scale}
          />
        </section>
      ))}
    </div>
  ),
};
export const CompactCassette: Story = { args: { cassetteScale: 0.9 } };
export const SmallCassette: Story = { args: { cassetteScale: 0.85 } };

export const GraphiteTones: Story = {
  render: (args) => (
    <div className="space-y-5">
      {[
        { label: 'Light graphite', className: 'film-roll-tone-light' },
        {
          label: 'Soft graphite · slightly darker',
          className: 'film-roll-tone-soft',
        },
        {
          label: 'Sidebar graphite · application surface',
          className: 'film-roll-tone-sidebar',
        },
        { label: 'Deep graphite · darkest', className: 'film-roll-tone-deep' },
      ].map(({ label, className }) => (
        <section key={label} className="space-y-2">
          <h2 className="text-sm font-medium text-content-primary">{label}</h2>
          <InteractiveRoll
            {...args}
            photos={photos.slice(0, 3)}
            className={className}
          />
        </section>
      ))}
    </div>
  ),
};
export const SoftGraphite: Story = {
  args: { className: 'film-roll-tone-soft' },
};
export const SidebarGraphite: Story = {
  args: { className: 'film-roll-tone-sidebar' },
};
export const DeepGraphite: Story = {
  args: { className: 'film-roll-tone-deep' },
};
