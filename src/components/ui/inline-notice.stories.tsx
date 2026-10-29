import type { Meta, StoryObj } from '@storybook/react-vite';
import { InlineNotice } from './inline-notice';
const meta = {
  title: 'Selection & feedback/InlineNotice',
  component: InlineNotice,
  args: {
    children: 'Output is larger than the original. Try a lower JPEG quality.',
    tone: 'warning',
  },
} satisfies Meta<typeof InlineNotice>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Warning: Story = {};
export const Info: Story = {
  args: {
    tone: 'info',
    children: 'Source metadata is removed from the exported copy.',
  },
};
export const Error: Story = {
  args: { tone: 'error', children: 'Could not prepare the export.' },
};
