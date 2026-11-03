import type { Meta, StoryObj } from '@storybook/react-vite';
import { GitHubMark } from './github-mark';

const meta = {
  title: 'Components/Brand/GitHubMark',
  component: GitHubMark,
  parameters: {
    docs: {
      description: {
        component:
          'GitHub Octicons mark for links to the project repository. Decorative beside a text label; follows currentColor. MIT license included in bundled notices.',
      },
    },
  },
  args: { width: 24, height: 24, className: 'size-6 text-content-primary' },
} satisfies Meta<typeof GitHubMark>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Accent: Story = {
  args: { className: 'size-6 text-accent-color' },
};
