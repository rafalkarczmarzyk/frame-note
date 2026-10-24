import type { Meta, StoryObj } from '@storybook/react-vite';
import { FrameNoteLogo } from './frame-note-logo';
const meta = {
  title: 'Components/Brand/FrameNoteLogo',
  component: FrameNoteLogo,
  args: { className: 'h-8 w-auto text-content-primary' },
} satisfies Meta<typeof FrameNoteLogo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Accent: Story = {
  args: { className: 'h-8 w-auto text-accent-color' },
};
