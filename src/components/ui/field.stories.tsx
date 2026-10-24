import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from './field';
import { Input } from './input';
const meta = {
  title: 'Components/UI/Field',
  component: Field,
  args: {
    label: 'Photo name',
    hint: 'A label and help text linked to the control.',
    children: (id: string, descriptionId: string | undefined) => (
      <Input
        id={id}
        aria-describedby={descriptionId}
        placeholder="Photo name"
      />
    ),
  },
  argTypes: { children: { control: false } },
} satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;
export const WithHint: Story = {};
export const Error: Story = { args: { error: 'Please enter a photo name.' } };
