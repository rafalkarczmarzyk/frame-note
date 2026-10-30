import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Ruler, Type } from 'lucide-react';
import { InlineInputGroup } from './inline-input-group';
import { NumberField } from './number-field';
import { SegmentedControl } from './segmented-control';

const meta = {
  title: 'Field groups/InlineInputGroup',
  component: InlineInputGroup,
  parameters: {
    docs: {
      description: {
        component:
          '36 px layout row for related controls. Shared surfaces use control-segments with 4 px padding and 28 px inner controls.',
      },
    },
  },
} satisfies Meta<typeof InlineInputGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

function Examples() {
  const [unit, setUnit] = useState('font');
  const [height, setHeight] = useState(1.5);
  const [fontSize, setFontSize] = useState(3);
  return (
    <div className="max-w-md space-y-4">
      <InlineInputGroup label="Graphic sizing">
        <SegmentedControl
          label="Sizing mode"
          value={unit}
          onValueChange={setUnit}
          options={[
            { value: 'font', label: 'Relative', content: <Type /> },
            { value: 'document', label: 'Fixed', content: <Ruler /> },
          ]}
          className="min-w-0 flex-[1.1]"
        />
        <NumberField
          label="Graphic height"
          hideLabel
          value={height}
          onValueChange={setHeight}
          min={0.1}
          max={100}
          step={0.1}
          unit={unit === 'font' ? '×' : 'px'}
        />
      </InlineInputGroup>
      <InlineInputGroup
        label="Font size"
        className="grid grid-cols-[1rem_minmax(0,1fr)]"
      >
        <Type className="size-4 text-content-secondary" aria-hidden="true" />
        <NumberField
          label="Font size"
          hideLabel
          value={fontSize}
          onValueChange={setFontSize}
          min={0.1}
          max={100}
          step={0.1}
          unit="% S"
        />
      </InlineInputGroup>
    </div>
  );
}

export const CompactControls: Story = {
  args: { children: null },
  render: () => <Examples />,
};
