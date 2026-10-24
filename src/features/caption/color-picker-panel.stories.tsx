import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ColorPickerPanel } from './color-picker-panel';
import { captionColorLabel, normalizeHex } from '@/domain/caption-colors';
import { ColorSwatch } from '@/components/ui/color-swatch';

const meta = {
  title: 'Components/UI/ColorPicker',
  component: ColorPickerPanel,
  args: { value: 'porcelain', onChange: () => {}, onClose: () => {} },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ColorPickerPanel>;
export default meta;
type Story = StoryObj<typeof meta>;
function Interactive({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  return (
    <div className="flex flex-wrap items-start gap-6 p-6">
      <ColorPickerPanel
        value={value}
        onChange={setValue}
        onClose={() => {}}
        className="h-[660px] max-h-[calc(100dvh-3rem)] w-80"
      />
      <p className="flex items-center gap-2 text-xs">
        <ColorSwatch value={value} />
        {captionColorLabel(value)}
      </p>
    </div>
  );
}
export const Default: Story = {
  render: () => <Interactive initial="porcelain" />,
};
export const Custom: Story = {
  render: () => <Interactive initial={normalizeHex('abc')!} />,
};
