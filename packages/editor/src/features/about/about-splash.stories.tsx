import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AboutSplash } from './about-splash';
import { Button } from '@/components/ui/button';
function Preview({ initiallyOpen = true }: { initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        About FrameNote
      </Button>
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
          'The former photographic start screen, opened explicitly by the header logo as an informational dialog. Includes version, local-processing note and project links. Close with X, Back to editor, Escape or the backdrop; the editor remains mounted. Keyboard focus is contained in the native dialog and returns to its opener.',
      },
    },
  },
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Splash: Story = {};
export const Closed: Story = { args: { initiallyOpen: false } };
