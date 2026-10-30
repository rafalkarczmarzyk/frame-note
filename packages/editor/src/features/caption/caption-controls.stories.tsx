import { expect, userEvent, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { CaptionControls } from './caption-controls';
import { createCaption } from '../../../../core/src/document';
import { convertSizing } from '../../../../core/src/sizing';
const dimensions = { width: 6000, height: 4000 };
const meta = {
  title: 'Pickers/CaptionControls',
  component: CaptionControls,
  args: {
    caption: createCaption(),
    dimensions,
    disabled: false,
    onChange: () => {},
    onBrowseFonts: () => {},
    onBrowseColors: () => {},
  },
  render: function Render(args) {
    const [caption, setCaption] = useState(args.caption);
    return (
      <div className="w-full max-w-xs">
        <CaptionControls {...args} caption={caption} onChange={setCaption} />
      </div>
    );
  },
} satisfies Meta<typeof CaptionControls>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Pixels: Story = {
  args: { caption: convertSizing(createCaption(), 'px', dimensions) },
};
export const LongEdge: Story = {
  args: { caption: convertSizing(createCaption(), 'long-edge', dimensions) },
};
export const Portrait: Story = {
  args: { dimensions: { width: 4000, height: 6000 } },
};
export const Disabled: Story = { args: { disabled: true } };

export const CompactInspector: Story = {
  args: { scope: 'local' },
};
export const CustomInspector: Story = {
  args: {
    scope: 'local',
    caption: {
      ...createCaption(),
      position: { ...createCaption().position, custom: { x: 25, y: 75 } },
    },
  },
};

export const ItalicInspector: Story = {
  args: {
    scope: 'local',
    caption: {
      ...createCaption(),
      style: { ...createCaption().style, fontStyle: 'italic', fontWeight: 700 },
    },
  },
};
export const NoItalicInspector: Story = {
  args: {
    scope: 'local',
    caption: {
      ...createCaption(),
      style: { ...createCaption().style, fontFamily: 'Advercase' },
    },
  },
};

export const NumericSteps: Story = {
  args: CustomInspector.args,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(
      c.getByRole('button', { name: 'Increase Font size' }),
    );
    await expect(c.getByRole('spinbutton', { name: 'Font size' })).toHaveValue(
      2.25,
    );
    await userEvent.click(
      c.getByRole('button', { name: 'Increase Line spacing' }),
    );
    await expect(
      c.getByRole('spinbutton', { name: 'Line spacing' }),
    ).toHaveValue(1.5);
    await userEvent.click(
      c.getByRole('button', { name: 'Decrease Opacity value' }),
    );
    await expect(
      c.getByRole('spinbutton', { name: 'Opacity value' }),
    ).toHaveValue(99);
    await userEvent.click(
      c.getByRole('button', { name: 'Increase X position' }),
    );
    await expect(c.getByRole('spinbutton', { name: 'X position' })).toHaveValue(
      25.1,
    );
    await userEvent.click(
      c.getByRole('button', { name: 'Decrease Y position' }),
    );
    await expect(c.getByRole('spinbutton', { name: 'Y position' })).toHaveValue(
      74.9,
    );
  },
};

export const TooltipHelp: Story = {
  args: { scope: 'local' },
  parameters: {
    docs: {
      description: {
        story:
          'Hover or focus font, size, spacing, alignment and style controls to inspect glass help. Escape dismisses help without changing values.',
      },
    },
  },
};
export const UnavailableFontStyles: Story = {
  args: {
    scope: 'local',
    caption: {
      ...createCaption(),
      style: { ...createCaption().style, fontFamily: 'Prata' },
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Unavailable font styles remain described and focusable through aria-disabled, while activation leaves the caption unchanged. The global disabled state still uses native disabled controls.',
      },
    },
  },
};
