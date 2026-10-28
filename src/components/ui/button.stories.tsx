import { Plus } from 'lucide-react';
import { IconButton } from './icon-button';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';
const meta = {
  title: 'Components/UI/Button',
  component: Button,
  args: { children: 'Export JPG' },
  parameters: {
    docs: {
      description: {
        component:
          'Primary and outline actions. Icon content inherits currentColor; className allows Tailwind overrides.',
      },
    },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {};
export const Outline: Story = { args: { variant: 'outline' } };
export const Disabled: Story = { args: { disabled: true } };
export const Small: Story = { args: { size: 'sm' } };

export const Palette: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(
        ['violet', 'turquoise', 'yellow', 'crimson', 'rose-brown'] as const
      ).map((color) => (
        <Button key={color} color={color}>
          {color}
        </Button>
      ))}
    </div>
  ),
};

export const WithIcon: Story = {
  args: { icon: <Plus aria-hidden="true" />, children: 'Add layer' },
};
export const Variants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline">Label</Button>
        <Button variant="outline" icon={<Plus aria-hidden="true" />}>
          Add layer
        </Button>
        <IconButton label="Add layer">
          <Plus aria-hidden="true" />
        </IconButton>
      </div>
      <div
        role="group"
        aria-label="Grouped actions"
        className="control-segments inline-flex gap-1"
      >
        <Button variant="outline">Label</Button>
        <Button variant="outline" icon={<Plus aria-hidden="true" />}>
          Add layer
        </Button>
        <IconButton label="Add layer">
          <Plus aria-hidden="true" />
        </IconButton>
      </div>
      <p className="text-xs text-content-secondary">
        Icon only: 18 / 16 px. Icon with label: 14 / 12 px. Standalone /
        grouped.
      </p>
    </div>
  ),
};
