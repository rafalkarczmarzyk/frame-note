import type { Meta, StoryObj } from '@storybook/react-vite';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { NumberFieldMenu } from './number-field-menu';

function ZoomPreview({
  startFit = false,
  disabled = false,
}: {
  startFit?: boolean;
  disabled?: boolean;
}) {
  const [zoom, setZoom] = useState<number | 'fit'>(startFit ? 'fit' : 104);
  const percentage = zoom === 'fit' ? 43 : zoom;
  return (
    <NumberFieldMenu
      className="w-32 shrink-0"
      label="Zoom percentage"
      menuLabel="Zoom presets"
      value={percentage}
      min={25}
      max={800}
      unit="%"
      onValueChange={setZoom}
      disabled={disabled}
      items={[
        {
          label: 'Fit',
          icon: zoom === 'fit' ? <Check aria-hidden="true" /> : undefined,
          onSelect: () => setZoom('fit'),
        },
        {
          label: '100%',
          icon: zoom === 100 ? <Check aria-hidden="true" /> : undefined,
          onSelect: () => setZoom(100),
        },
      ]}
    />
  );
}

const meta = {
  title: 'Fields/NumberFieldMenu',
  component: ZoomPreview,
} satisfies Meta<typeof ZoomPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('spinbutton', { name: 'Zoom percentage' });
    const menu = canvas.getByRole('button', { name: 'Zoom presets' });
    await userEvent.clear(input);
    await userEvent.type(input, '125{Enter}');
    await expect(input).toHaveValue(125);
    await userEvent.click(menu);
    await userEvent.click(await page.findByRole('menuitem', { name: 'Fit' }));
    await expect(input).toHaveValue(43);
    await userEvent.click(menu);
    await userEvent.click(await page.findByRole('menuitem', { name: '100%' }));
    await expect(input).toHaveValue(100);
  },
};

export const FitActive: Story = { args: { startFit: true } };
export const Disabled: Story = { args: { disabled: true } };
