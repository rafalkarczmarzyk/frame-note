import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './input';
const meta = {
  title: 'Components/UI/Input',
  component: Input,
  args: { 'aria-label': 'Search', placeholder: 'Search metadata…' },
  parameters: {
    docs: {
      description: {
        component:
          'Shared text/search input. Always supply an accessible label (Field or aria-label). Supports native events, disabled and aria-invalid.',
      },
    },
  },
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Invalid: Story = {
  args: { 'aria-invalid': true, defaultValue: 'Invalid value' },
};
