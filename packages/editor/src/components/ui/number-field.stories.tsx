import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { NumberField } from './number-field';
const meta = {
  title: 'Fields/NumberField',
  component: NumberField,
  args: {
    label: 'Size (% short edge)',
    value: 1.35,
    step: 0.1,
    min: 0.01,
    max: 20,
    onValueChange: () => {},
  },
  parameters: {
    docs: {
      description: {
        component:
          'Controlled numeric field. Keeps an editing draft for fractions and empty input; restores a valid value on blur. External values update when unfocused.',
      },
    },
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <NumberField {...args} value={value} onValueChange={setValue} />;
  },
} satisfies Meta<typeof NumberField>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Fractional: Story = {};
export const Disabled: Story = { args: { disabled: true } };

function DragToAdjustPrototype() {
  const [value, setValue] = useState(3);
  const step = 0.1;
  const min = 0.1;
  const max = 20;

  return (
    <div className="max-w-72">
      <NumberField
        label="Font size"
        value={value}
        onValueChange={setValue}
        min={min}
        max={max}
        step={step}
        unit="% S"
      />
      <p className="mt-2 text-xs text-content-secondary">
        Drag vertically on either arrow to adjust · click an arrow for one step
        · click the value to type
      </p>
    </div>
  );
}

export const DragToAdjust: Story = {
  render: () => <DragToAdjustPrototype />,
  parameters: {
    docs: {
      description: {
        story:
          'Drag vertically on either stepper arrow to adjust by 0.1 per 4 px. Clicking an arrow still changes one step, and the value remains directly editable.',
      },
    },
  },
};

export const StepperLimits: Story = {
  args: {
    label: 'Example value',
    value: 0,
    min: 0,
    max: 0.2,
    step: 0.1,
    unit: '%',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton');
    const increase = canvas.getByRole('button', {
      name: 'Increase Example value',
    });
    const decrease = canvas.getByRole('button', {
      name: 'Decrease Example value',
    });
    await expect(decrease).toBeDisabled();
    await userEvent.click(increase);
    await expect(input).toHaveValue(0.1);
    await userEvent.click(increase);
    await expect(input).toHaveValue(0.2);
    await expect(increase).toBeDisabled();
    await userEvent.click(decrease);
    await expect(input).toHaveValue(0.1);
  },
};

export const FontSizeStep: Story = {
  args: {
    label: 'Font size',
    value: 2,
    min: 0.0001,
    max: 20,
    step: 0.1,
    unit: '% S',
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByRole('spinbutton');
    await userEvent.click(
      c.getByRole('button', { name: 'Increase Font size' }),
    );
    await expect(input).toHaveValue(2.1);
    input.focus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(input).toHaveValue(2.2);
    await userEvent.keyboard('{ArrowDown}');
    await expect(input).toHaveValue(2.1);
    // Values entered by hand retain precision; steppers add rather than snap.
    await userEvent.clear(input);
    await userEvent.type(input, '2.13');
    await expect(input).toBeValid();
    await userEvent.keyboard('{ArrowUp}');
    await expect(input).toHaveValue(2.23);
  },
};
export const LineSpacingStep: Story = {
  args: {
    label: 'Line spacing',
    value: 1.4,
    min: 0.5,
    max: 3,
    step: 0.1,
    unit: '×',
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(
      c.getByRole('button', { name: 'Increase Line spacing' }),
    );
    await expect(c.getByRole('spinbutton')).toHaveValue(1.5);
    await userEvent.click(
      c.getByRole('button', { name: 'Decrease Line spacing' }),
    );
    await expect(c.getByRole('spinbutton')).toHaveValue(1.4);
  },
};
