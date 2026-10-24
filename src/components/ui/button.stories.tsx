import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';
const meta = {
  title: 'Atoms/Button',
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
