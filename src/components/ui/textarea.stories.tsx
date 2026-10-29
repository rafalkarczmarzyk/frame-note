import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './textarea';
const meta = {
  title: 'Fields/Textarea',
  component: Textarea,
  args: {
    'aria-label': 'Caption',
    rows: 5,
    defaultValue: '{exif:Artist}\n{exif:LensModel}',
  },
} satisfies Meta<typeof Textarea>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };

export const Invalid: Story = { args: { 'aria-invalid': true } };
