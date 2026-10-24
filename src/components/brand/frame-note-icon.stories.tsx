import type { Meta, StoryObj } from '@storybook/react-vite';
import { FrameNoteIcon } from './frame-note-icon';

const meta = {
  title: 'Components/Brand/FrameNoteIcon',
  component: FrameNoteIcon,
  args: { width: 32, height: 32, className: 'size-8 text-foreground' },
} satisfies Meta<typeof FrameNoteIcon>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Accent: Story = {
  args: { className: 'size-8 text-primary' },
};
