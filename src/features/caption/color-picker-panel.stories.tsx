import { expect, userEvent, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ColorPickerPanel } from './color-picker-panel';
import { normalizeHex } from '@/domain/caption-colors';
import { ColorControls } from './color-controls';

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
        surface="solid"
        value={value}
        onChange={setValue}
        onClose={() => {}}
        className="h-[560px] max-h-[calc(100dvh-3rem)] w-80"
      />
      <div className="w-80 rounded-xl bg-panel-base p-4">
        <ColorControls value={value} onChange={setValue} onBrowse={() => {}} />
      </div>
    </div>
  );
}
export const Default: Story = {
  render: () => <Interactive initial="porcelain" />,
};
export const Custom: Story = {
  render: () => <Interactive initial={normalizeHex('abc')!} />,
};
export const SelectPaletteColor: Story = {
  render: () => <Interactive initial="porcelain" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: 'Sage' }));
    await expect(c.getByRole('button', { name: 'Sage' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await userEvent.click(c.getByRole('button', { name: 'Custom color' }));
    await expect(
      c.getByRole('textbox', { name: 'Custom color (HEX)' }),
    ).toBeVisible();
  },
};
