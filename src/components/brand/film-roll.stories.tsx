import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilmRollStart } from './film-roll-start';
import { FilmRollFrame } from './film-roll-frame';
import { FilmRollEnd } from './film-roll-end';

const meta = {
  title: 'Components/Brand/FilmRoll',
  component: FilmRollStart,
  args: { width: 98, height: 156 },
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
      <FilmRollStart width={98} height={156} className="shrink-0" />
      <FilmRollFrame width={128} height={112} className="mt-[26px] shrink-0" />
      <FilmRollFrame width={128} height={112} className="mt-[26px] shrink-0" />
      <FilmRollFrame width={128} height={112} className="mt-[26px] shrink-0" />
      <FilmRollEnd width={130} height={112} className="mt-[26px] shrink-0" />
    </div>
  ),
};
