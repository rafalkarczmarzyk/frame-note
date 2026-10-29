import type { Meta, StoryObj } from '@storybook/react-vite';
import { MacroIcon } from './macro-icon';

const meta = {
  title: 'Foundations/MacroIcon',
  component: MacroIcon,
  args: { width: 24, height: 24, className: 'text-content-primary' },
} satisfies Meta<typeof MacroIcon>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Accent: Story = { args: { className: 'text-accent-color' } };
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {[12, 16, 24, 32].map((size) => (
        <MacroIcon key={size} width={size} height={size} />
      ))}
    </div>
  ),
};
