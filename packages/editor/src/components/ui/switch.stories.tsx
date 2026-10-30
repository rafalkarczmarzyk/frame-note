import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Switch } from './switch';

const meta = {
  title: 'Selection & feedback/Switch',
  component: Switch,
  args: {
    label: 'Remove all metadata',
    checked: false,
    onCheckedChange: () => {},
  },
  render: function Render(args) {
    const [checked, setChecked] = useState(args.checked);
    return (
      <div className="max-w-sm p-3">
        <Switch {...args} checked={checked} onCheckedChange={setChecked} />
      </div>
    );
  },
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Off: Story = {};
export const On: Story = { args: { checked: true } };
export const DisabledOff: Story = { args: { disabled: true } };
export const DisabledOn: Story = { args: { checked: true, disabled: true } };
export const Description: Story = {
  args: {
    description:
      'Source metadata is removed from the exported file. Your visible captions stay on the photo.',
  },
};
export const LongLabel: Story = {
  args: {
    label: 'Remove all identifying metadata from the exported photograph',
    description: 'A long label wraps without shrinking the control.',
  },
};
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-52">
        <Story />
      </div>
    ),
  ],
  args: LongLabel.args,
};
export const KeyboardAndLabel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch');
    control.focus();
    await userEvent.keyboard(' ');
    await expect(control).toBeChecked();
    await userEvent.keyboard('{Enter}');
    await expect(control).not.toBeChecked();
    await userEvent.click(canvas.getByText('Remove all metadata'));
    await expect(control).toBeChecked();
  },
};
export const DisabledInteraction: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole('switch');
    await userEvent.click(control);
    await expect(control).not.toBeChecked();
  },
};
export const FieldsetDisabled: Story = {
  decorators: [
    (Story) => (
      <fieldset disabled>
        <Story />
      </fieldset>
    ),
  ],
};
