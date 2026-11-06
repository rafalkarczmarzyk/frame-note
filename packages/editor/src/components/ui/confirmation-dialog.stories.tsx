import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from './button';
import { ConfirmationDialog } from './confirmation-dialog';

const meta = {
  title: 'Sidebar & panels/ConfirmationDialog',
  component: ConfirmationDialog,
  args: {
    title: 'Delete preset?',
    description:
      'Delete “My preset” from your saved presets? This cannot be undone.',
    confirmLabel: 'Delete preset',
    busy: false,
    onConfirm: () => {},
    onCancel: () => {},
  },
  parameters: {
    docs: {
      story: { inline: false, height: '500px' },
      description: {
        component:
          'Use for a blocking decision before an action. Mount while pending. Supply a title, description, explicit confirmLabel and callbacks. Cancel and Escape dismiss; busy disables both actions and Escape during a save. Modal contains and restores focus. The caller owns persistence and error feedback. Used for preset deletion and discarding unsaved changes.',
      },
    },
  },
  render: function Preview(args) {
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState('');
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open confirmation</Button>
        <p role="status">{result}</p>
        {open && (
          <ConfirmationDialog
            {...args}
            onCancel={() => {
              setOpen(false);
              setResult('Cancelled');
            }}
            onConfirm={() => {
              setOpen(false);
              setResult('Confirmed');
            }}
          />
        )}
      </>
    );
  },
} satisfies Meta<typeof ConfirmationDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const opener = canvas.getByRole('button', { name: 'Open confirmation' });
    await userEvent.click(opener);
    await userEvent.keyboard('{Escape}');
    await expect(opener).toHaveFocus();
    await expect(canvas.getByRole('status')).toHaveTextContent('Cancelled');
    await userEvent.click(opener);
    await userEvent.click(
      canvas.getByRole('button', { name: /^Delete preset$/ }),
    );
    await expect(canvas.getByRole('status')).toHaveTextContent('Confirmed');
    await expect(opener).toHaveFocus();
  },
};
export const Saving: Story = { args: { busy: true } };
export const DiscardChanges: Story = {
  args: {
    title: 'Discard unsaved changes?',
    description:
      'Unsaved changes will be lost. Apply “Photo Details” from its saved version?',
    confirmLabel: 'Discard changes',
  },
};
