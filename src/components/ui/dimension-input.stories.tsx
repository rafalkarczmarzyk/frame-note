import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { DimensionInput } from './dimension-input';
import { Field } from './field';
const meta = {
  title: 'Fields/DimensionInput',
  component: DimensionInput,
  args: {
    value: 115.68,
    min: 0,
    max: 10000,
    step: 1,
    unit: 'px',
    onValueChange: () => {},
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <div className="w-28">
        <Field label="Dimension">
          {(id) => (
            <DimensionInput
              {...args}
              id={id}
              value={value}
              onValueChange={setValue}
            />
          )}
        </Field>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        component:
          'Numeric input with a required, always-visible unit. The unit reserves its own space and cannot be edited here. Used by font size, all four margins, opacity and line height through NumberField.',
      },
    },
  },
} satisfies Meta<typeof DimensionInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Pixels: Story = {};
export const ShortEdge: Story = { args: { unit: '% S', value: 3, step: 0.1 } };
export const LongEdge: Story = { args: { unit: '% L', value: 2, step: 0.1 } };
export const Percent: Story = { args: { unit: '%', value: 75 } };
export const Multiplier: Story = { args: { unit: '×', value: 1.4, step: 0.1 } };
export const Disabled: Story = { args: { disabled: true } };
