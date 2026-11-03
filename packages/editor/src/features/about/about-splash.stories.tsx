import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { AboutSplash } from './about-splash';
import { Button } from '@/components/ui/button';
function Preview() {
  const [open, setOpen] = useState(true);
  return (
    <>
      {!open && (
        <Button variant="outline" onClick={() => setOpen(true)}>
          About FrameNote
        </Button>
      )}
      {open && <AboutSplash onClose={() => setOpen(false)} />}
    </>
  );
}
const meta = {
  title: 'Screens/AboutFrameNote',
  component: Preview,
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, height: '800px' },
      description: {
        component:
          'Shared web and desktop About: one continuous photograph cropped to keep the bird visible and the right fence post outside the frame, with a dark frosted information overlay on the left. Licenses replaces the content without resizing the dialog and blurs the same photo underneath. Includes version/build, project links and the offline license reader, including native runtime notices in packaged desktop builds. Close with X, Escape or the backdrop; initial focus is neutral. Back to About restores focus to Licenses.',
      },
    },
  },
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const About: Story = {};
export const LicenseReader: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('link', { name: /^Licenses$/ }),
    );
    await waitFor(() =>
      expect(
        canvas.getByLabelText('Full licenses and notices'),
      ).toHaveTextContent('GNU GENERAL PUBLIC LICENSE'),
    );
  },
};
