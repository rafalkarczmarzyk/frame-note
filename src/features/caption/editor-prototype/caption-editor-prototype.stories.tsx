import type { Meta, StoryObj } from '@storybook/react-vite';
import { CaptionEditorPrototype } from './caption-editor-prototype';

const meta = {
  title: 'Screens/CaptionEditorPrototype',
  component: CaptionEditorPrototype,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CaptionEditorPrototype>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
