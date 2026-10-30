import type { Meta, StoryObj } from '@storybook/react-vite';
import { AutoAlign } from './auto-align';

const meta = {
  title: 'Foundations/AutoAlign',
  component: AutoAlign,
  args: { width: 20, height: 16, className: 'text-content-primary' },
} satisfies Meta<typeof AutoAlign>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Accent: Story = { args: { className: 'text-accent-color' } };
