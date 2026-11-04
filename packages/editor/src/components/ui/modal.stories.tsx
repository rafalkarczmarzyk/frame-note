import { useId, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from './button';
import { Modal } from './modal';
function Preview() {
  const [open, setOpen] = useState(false);
  const title = useId();
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      {open && (
        <Modal titleId={title} onClose={() => setOpen(false)}>
          <div className="space-y-4 p-8">
            <h1 id={title} className="text-xl font-semibold">
              Modal dialog
            </h1>
            <p className="text-xs text-content-secondary">
              Focus stays inside. Escape closes; the backdrop keeps the dialog
              open.
            </p>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
const meta = {
  title: 'Sidebar & panels/Modal',
  component: Preview,
  parameters: {
    docs: {
      story: { inline: false, height: '500px' },
      description: {
        component:
          'Shared native dialog for blocking content. Supply titleId and onClose; descriptionId links introductory text. The optional closeOnBackdrop is used by About; forms keep it off. busy prevents cancellation while saving. The browser contains focus and restores it on close. Content and width are composed by each feature. See Screens/DesktopSettings and Screens/AboutFrameNote.',
      },
    },
  },
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const opener = canvas.getByRole('button', { name: 'Open modal' });
    await userEvent.click(opener);
    const close = canvas.getByRole('button', { name: /^Close$/ });
    await userEvent.tab({ shift: true });
    await expect(close).toHaveFocus();
    await userEvent.tab();
    await expect(close).toHaveFocus();
    await userEvent.click(close);
    await expect(opener).toHaveFocus();
  },
};
