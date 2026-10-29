import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CaptionEditor } from './caption-editor';
import { builtinIcons } from '../builtin-icons';
const noop = () => {};
function WhitespacePreview() {
  const [value, setValue] = useState(
    'A  B {author}\nA long line that wraps visually in this narrow editor without adding another real line break.\n\n{icon:camera} Photo',
  );
  return (
    <div className="w-80 bg-sidebar-base p-3 text-content-primary">
      <CaptionEditor
        value={value}
        fields={[]}
        hasPhoto={false}
        icons={builtinIcons}
        onChange={setValue}
        onFocus={noop}
        onBlur={noop}
        onReady={noop}
      />
    </div>
  );
}
const meta = {
  title: 'Pickers/CaptionWhitespace',
  component: WhitespacePreview,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof WhitespacePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SpacesAndLineBreaks: Story = {};
