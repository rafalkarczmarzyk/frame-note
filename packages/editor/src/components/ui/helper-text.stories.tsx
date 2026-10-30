import type { Meta, StoryObj } from '@storybook/react-vite';
import { HelperText } from './helper-text';
import { NumberField } from './number-field';

const meta = {
  title: 'Fields/HelperText',
  component: HelperText,
  args: {
    children:
      'Multiplies the font size. For example, 1.4× with a 20 px font gives a 28 px line height.',
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HelperText>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithInput: Story = {
  render: ({ children }) => (
    <NumberField
      label="Line height"
      unit="×"
      value={1.4}
      step={0.1}
      min={0.5}
      max={3}
      onValueChange={() => {}}
      hint={String(children)}
    />
  ),
};
