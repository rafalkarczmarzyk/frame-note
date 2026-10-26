import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlignAuto } from './align-auto';

const meta = {
  title: 'Components/UI/AlignAuto',
  component: AlignAuto,
  args: { width: 24, height: 24, className: 'text-content-primary' },
} satisfies Meta<typeof AlignAuto>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Accent: Story = { args: { className: 'text-accent-color' } };
