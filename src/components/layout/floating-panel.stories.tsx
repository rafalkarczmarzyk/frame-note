import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../ui/button';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FloatingPanel } from './floating-panel';
import { Input } from '../ui/input';
import { PickerList } from '../ui/picker-list';
const meta = {
  title: 'Sidebar & panels/FloatingPanel',
  component: FloatingPanel,
  args: {
    title: 'Available tags',
    description: 'Non-modal, independent from the main sidebar.',
    onClose: () => {},
    toolbar: <Input aria-label="Search tags" placeholder="Search fields…" />,
    children: (
      <PickerList
        items={Array.from({ length: 20 }, (_, index) => ({
          id: String(index),
          label: `exif:Field${index}`,
          description: 'A readable metadata value',
          selected: index === 0,
        }))}
        onChoose={() => {}}
      />
    ),
  },
  decorators: [
    (Story) => (
      <div className="relative h-[540px] w-full max-w-2xl overflow-hidden bg-drop-base">
        <div className="absolute inset-8 grid grid-cols-2 gap-6 text-drop-text">
          <div className="bg-button-primary-base p-6 text-2xl">Canvas</div>
          <div className="bg-app-base p-6 text-content-primary">Preview</div>
        </div>
        <div className="absolute inset-y-5 right-5 w-80">
          <Story />
        </div>
      </div>
    ),
  ],
  render: (args) => <FloatingPanel {...args} className="h-full" />,
} satisfies Meta<typeof FloatingPanel>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Glass: Story = {};
export const SolidFallback: Story = { args: { surface: 'solid' } };
export const FontContent: Story = {
  args: {
    title: 'Choose a font',
    description: 'Same panel, different content.',
    toolbar: <Input aria-label="Search fonts" placeholder="Search fonts…" />,
    children: (
      <PickerList
        items={[
          {
            id: 'montserrat',
            label: 'Montserrat',
            preview: (
              <span className="font-sans text-xl">Leave your mark.</span>
            ),
          },
          {
            id: 'advercase',
            label: 'Advercase',
            selected: true,
            preview: (
              <span className="font-display text-2xl">Leave your mark.</span>
            ),
          },
        ]}
        onChoose={() => {}}
      />
    ),
  },
};

export const KeyboardFocus: Story = {
  render: function KeyboardFocus(args) {
    const [open, setOpen] = useState(false);
    return (
      <div className="space-y-2">
        <Button onClick={() => setOpen(true)}>Open panel</Button>
        {open && (
          <FloatingPanel
            {...args}
            className="max-h-[440px]"
            onClose={() => setOpen(false)}
          />
        )}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open panel' });
    await userEvent.click(trigger);
    await waitFor(() =>
      expect(
        canvas.getByRole('textbox', { name: 'Search tags' }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
