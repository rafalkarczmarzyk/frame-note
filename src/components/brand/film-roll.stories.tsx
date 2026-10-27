import { FilmRollLeader } from './film-roll-leader';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilmRollStart } from './film-roll-start';
import { FilmRollFrame } from './film-roll-frame';
import { FilmRollEnd } from './film-roll-end';

const meta = {
  title: 'Components/Brand/FilmRoll',
  component: FilmRollStart,
  args: { width: 122.5, height: 195, variant: 'emerald', exposures: 12 },
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
  render: () => <FilmRollFrame width={128} height={112} />,
};
export const End: Story = {
  render: () => <FilmRollEnd width={130} height={112} />,
};
export const Joined: Story = {
  render: () => (
    <div className="flex items-start overflow-x-auto">
      <FilmRollStart
        width={98}
        height={156}
        exposures={3}
        className="relative z-10 -mr-[6px] shrink-0"
      />
      <FilmRollFrame width={128} height={112} className="mt-[26px] shrink-0" />
      <FilmRollFrame width={128} height={112} className="mt-[26px] shrink-0" />
      <FilmRollFrame width={128} height={112} className="mt-[26px] shrink-0" />
      <FilmRollEnd width={130} height={112} className="mt-[26px] shrink-0" />
    </div>
  ),
};

export const MultipleInstances: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-6">
      <FilmRollStart width={98} height={156} />
      <FilmRollStart width={122.5} height={195} />
      <FilmRollStart width={147} height={234} />
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
          width={122.5}
          height={195}
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
          width={122.5}
          height={195}
        />
      ))}
    </div>
  ),
};

export const Leader: Story = {
  render: () => <FilmRollLeader scale={2.5} width={640} height={140} />,
};
