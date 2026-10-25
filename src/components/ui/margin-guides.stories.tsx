import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarginGuides } from './margin-guides';
const meta = {
  title: 'Components/UI/MarginGuides',
  component: MarginGuides,
  args: {
    width: 480,
    height: 300,
    positions: { left: 35, right: 430, top: 25, bottom: 265 },
    active: null,
    linkMode: 'none',
  },
  argTypes: {
    active: {
      control: 'select',
      options: [null, 'top', 'right', 'bottom', 'left'],
    },
    linkMode: { control: 'radio', options: ['none', 'pairs', 'all'] },
  },
  render: (args) => (
    <div className="overflow-auto p-6">
      <div
        className="relative flex bg-content-primary"
        style={{ width: args.width, height: args.height }}
      >
        <div className="h-full w-1/2 bg-workspace-base" />
        <MarginGuides {...args} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        component:
          'Production non-interactive guide overlay. Positions are display coordinates, including right and bottom; no rulers, handles or photo required. Light/dark halves expose line contrast.',
      },
    },
  },
} satisfies Meta<typeof MarginGuides>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Neutral: Story = {};
export const ActiveEdge: Story = { args: { active: 'left' } };
export const HorizontalPair: Story = {
  args: { active: 'left', linkMode: 'pairs' },
};
export const VerticalPair: Story = {
  args: { active: 'top', linkMode: 'pairs' },
};
export const All: Story = { args: { active: 'left', linkMode: 'all' } };
export const AtEdges: Story = {
  args: { positions: { left: 0, right: 480, top: 0, bottom: 300 } },
};
export const NearlyOverlapping: Story = {
  args: {
    positions: { left: 239, right: 241, top: 149, bottom: 151 },
    active: 'top',
    linkMode: 'all',
  },
};
