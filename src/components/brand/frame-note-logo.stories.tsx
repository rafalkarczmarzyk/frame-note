import type { Meta, StoryObj } from '@storybook/react-vite';
import { FrameNoteLogo } from './frame-note-logo';
const meta = {
  title: 'Atoms/FrameNoteLogo',
  component: FrameNoteLogo,
  args: { className: 'h-8 w-auto text-foreground' },
} satisfies Meta<typeof FrameNoteLogo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Accent: Story = {
  args: { className: 'h-12 w-auto text-primary' },
};
