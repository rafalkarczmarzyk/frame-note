import type { Meta, StoryObj } from '@storybook/react-vite';
import { PhotoIcon } from './photo-icon';
const meta = {
  title: 'Components/UI/PhotoIcon',
  component: PhotoIcon,
  args: { width: 40, height: 40, className: 'text-content-primary' },
} satisfies Meta<typeof PhotoIcon>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Accent: Story = { args: { className: 'text-accent-color' } };
