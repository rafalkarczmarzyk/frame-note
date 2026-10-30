import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Ruler } from './ruler';
const meta = {
  title: 'Position & margins/Ruler',
  component: Ruler,
  args: {
    orientation: 'horizontal',
    length: 480,
    pixelsPerUnit: 4,
    unitLabel: '% S',
    active: false,
  },
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    length: { control: { type: 'range', min: 80, max: 800, step: 20 } },
    pixelsPerUnit: { control: { type: 'number', min: 0.01, step: 0.1 } },
    children: { table: { disable: true } },
  },
  render: (args) => (
    <div className="overflow-auto p-8">
      <Ruler {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        component:
          'One production ruler: adaptive ticks, labels, orientation and resting opacity. No handles, photo or document state.',
      },
    },
  },
} satisfies Meta<typeof Ruler>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Horizontal: Story = {};
export const Vertical: Story = { args: { orientation: 'vertical' } };
export const Active: Story = { args: { active: true } };
export const Pixels: Story = {
  args: { unitLabel: 'px', pixelsPerUnit: 0.08, active: true },
};
export const Small: Story = { args: { length: 120 } };
export const ScaleDensity: Story = {
  render: (args) => (
    <div className="space-y-6 p-8">
      {[0.08, 2, 8].map((factor) => (
        <section key={factor}>
          <p className="mb-2 text-xs">{factor} display px / unit</p>
          <Ruler {...args} pixelsPerUnit={factor} active />
        </section>
      ))}
    </div>
  ),
};
export const Hover: Story = {
  render: function Render(args) {
    const [active, setActive] = useState(false);
    return (
      <div className="p-8">
        <Ruler
          {...args}
          active={active}
          onMouseEnter={() => setActive(true)}
          onMouseLeave={() => setActive(false)}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const ruler = within(canvasElement).getByRole('group');
    await expect(ruler).toHaveStyle({ opacity: '0.6' });
    await userEvent.hover(ruler);
    await expect(ruler).toHaveStyle({ opacity: '1' });
    await userEvent.unhover(ruler);
    await expect(ruler).toHaveStyle({ opacity: '0.6' });
  },
};
