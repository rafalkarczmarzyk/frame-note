import { expect, userEvent, waitFor, within } from 'storybook/test';
import { SidebarSection } from '@/components/layout/sidebar-section';
import { Ruler } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { MarginEditor } from './margin-editor';
const meta = {
  title: 'Position & margins/MarginEditor',
  component: MarginEditor,
  args: {
    value: { top: 3, right: 3, bottom: 3, left: 3 },
    linkMode: 'none',
    unit: 'short-edge',
    unitLabel: '% S',
    dimensions: { width: 6000, height: 4000 },
    onChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    const [linkMode, setLinkMode] = useState(args.linkMode);
    return (
      <div className="w-full max-w-[280px]">
        <MarginEditor
          {...args}
          value={value}
          linkMode={linkMode}
          onChange={(next, nextLinked) => {
            setValue(next);
            setLinkMode(nextLinked);
          }}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        component:
          'Four independent edges using one document unit. None edits edges independently; Pairs links top/bottom and left/right; All links all edges. Unlinking preserves values. Hover or focus highlights the affected edge. Limits retain at least one source pixel inside the image.',
      },
    },
  },
} satisfies Meta<typeof MarginEditor>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Linked: Story = { args: { linkMode: 'all' } };
export const Pairs: Story = {
  args: { linkMode: 'pairs', value: { top: 2, bottom: 2, left: 4, right: 4 } },
};
export const Asymmetric: Story = {
  args: { value: { top: 2, right: 4, bottom: 6, left: 8 } },
};
export const Pixels: Story = {
  args: {
    unit: 'px',
    unitLabel: 'px',
    value: { top: 120, right: 120, bottom: 120, left: 120 },
  },
};
export const Disabled: Story = { args: { disabled: true } };

export const Compact: Story = { args: { appearance: 'compact' } };
export const CompactPaired: Story = {
  args: { ...Pairs.args, appearance: 'compact' },
};
export const CompactLinked: Story = {
  args: { linkMode: 'all', appearance: 'compact' },
};
export const CompactPixels: Story = {
  args: { ...Pixels.args, appearance: 'compact' },
};
export const CompactLongEdge: Story = {
  args: {
    appearance: 'compact',
    unit: 'long-edge',
    unitLabel: '% L',
    value: { top: 2, bottom: 2, left: 2, right: 2 },
  },
};
export const CompactDisabled: Story = {
  args: { appearance: 'compact', disabled: true },
};
export const CompactNarrow: Story = {
  args: { appearance: 'compact' },
  decorators: [
    (Story) => (
      <div className="w-[220px]">
        <Story />
      </div>
    ),
  ],
};
export const CompactFocused: Story = {
  args: { ...Pixels.args, appearance: 'compact' },
  play: async ({ canvasElement }) => {
    within(canvasElement).getByRole('spinbutton', { name: 'Left' }).focus();
    await waitFor(() =>
      expect(
        within(canvasElement).getByRole('button', { name: 'Increase Left' }),
      ).toBeVisible(),
    );
  },
};
export const CompactSidebar: Story = {
  args: { appearance: 'compact' },
  decorators: [
    (Story) => (
      <div className="w-[320px]">
        <SidebarSection
          id="compact-margin-preview"
          title="Margins"
          icon={<Ruler />}
          iconTone="sizing"
        >
          <Story />
        </SidebarSection>
      </div>
    ),
  ],
};
export const CompactInteraction: Story = {
  args: { appearance: 'compact' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const left = canvas.getByRole('spinbutton', { name: 'Left' });
    const right = canvas.getByRole('spinbutton', { name: 'Right' });
    await userEvent.click(canvas.getByRole('radio', { name: 'Paired' }));
    await userEvent.clear(left);
    await userEvent.type(left, '8');
    await userEvent.tab();
    await expect(right).toHaveValue(8);
    await userEvent.click(canvas.getByRole('radio', { name: 'Linked' }));
    for (const side of ['Top', 'Right', 'Bottom', 'Left'])
      await expect(canvas.getByRole('spinbutton', { name: side })).toHaveValue(
        3,
      );
    await userEvent.clear(left);
    await userEvent.type(left, '7');
    await userEvent.tab();
    await expect(canvas.getByRole('spinbutton', { name: 'Top' })).toHaveValue(
      7,
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Reset margins' }),
    );
    for (const side of ['Top', 'Right', 'Bottom', 'Left'])
      await expect(canvas.getByRole('spinbutton', { name: side })).toHaveValue(
        3,
      );
    await expect(canvas.getByRole('radio', { name: 'Linked' })).toHaveAttribute(
      'data-state',
      'on',
    );
  },
};
