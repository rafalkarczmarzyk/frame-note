import { FilmRollLeader } from './film-roll-leader';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilmRollStart } from './film-roll-start';
import { FilmRollFrame } from './film-roll-frame';
import { FilmRollEnd } from './film-roll-end';

const meta = {
  title: 'Photo session/Film roll artwork',
  component: FilmRollStart,
  args: { width: 96, height: 162, variant: 'emerald', exposures: 12 },
  argTypes: {
    variant: {
      control: 'select',
      options: ['emerald', 'gold', 'ivory', 'coral'],
    },
    exposures: { control: { type: 'number', min: 0, step: 1 } },
  },
} satisfies Meta<typeof FilmRollStart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Start: Story = {};
export const Frame: Story = {
  render: () => <FilmRollFrame width={148} height={129} />,
};
export const End: Story = {
  render: () => <FilmRollEnd width={150} height={129} />,
};
export const Joined: Story = {
  render: () => (
    <div className="flex items-start overflow-x-auto">
      <FilmRollStart
        width={96}
        height={162}
        exposures={3}
        className="relative z-10 -mr-px shrink-0"
      />
      <FilmRollFrame width={148} height={129} className="mt-[21px] shrink-0" />
      <FilmRollFrame width={148} height={129} className="mt-[21px] shrink-0" />
      <FilmRollFrame width={148} height={129} className="mt-[21px] shrink-0" />
      <FilmRollEnd width={150} height={129} className="mt-[21px] shrink-0" />
    </div>
  ),
};

export const MultipleInstances: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-6">
      <FilmRollStart width={80} height={135} />
      <FilmRollStart width={96} height={162} />
      <FilmRollStart width={112} height={189} />
    </div>
  ),
};

export const Emerald: Story = { args: { variant: 'emerald' } };
export const Gold: Story = { args: { variant: 'gold' } };
export const Ivory: Story = { args: { variant: 'ivory' } };
export const Coral: Story = { args: { variant: 'coral' } };
export const LabelVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-8">
      {(['emerald', 'gold', 'ivory', 'coral'] as const).map((variant) => (
        <FilmRollStart
          key={variant}
          variant={variant}
          exposures={12}
          width={96}
          height={162}
        />
      ))}
    </div>
  ),
};
export const ExposureCounts: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-8">
      {[2, 12, 128, 1024].map((exposures) => (
        <FilmRollStart
          key={exposures}
          exposures={exposures}
          width={96}
          height={162}
        />
      ))}
    </div>
  ),
};

export const Leader: Story = {
  render: () => <FilmRollLeader width={592} height={129} />,
};
