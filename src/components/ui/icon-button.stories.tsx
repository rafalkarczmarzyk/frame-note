import type { Meta, StoryObj } from '@storybook/react-vite';
import { X } from 'lucide-react';
import { IconButton } from './icon-button';
const meta = {
  title: 'Actions/IconButton',
  component: IconButton,
  args: { label: 'Close panel', children: <X aria-hidden="true" /> },
} satisfies Meta<typeof IconButton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
