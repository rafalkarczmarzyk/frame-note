import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  MoveVertical,
  Ruler,
  Type,
  UnfoldVertical,
} from 'lucide-react';
import { DimensionInput } from '@/components/ui/dimension-input';
import { Field } from '@/components/ui/field';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Tooltip } from '@/components/ui/tooltip';
import type { VerticalAlignment } from '../../../../../core/src/inline-icon';

function SizeLayout({ sharedWrapper }: { sharedWrapper: boolean }) {
  const [height, setHeight] = useState(1.75);
  const [unit, setUnit] = useState<'font' | 'document'>('font');
  const [alignment, setAlignment] = useState<VerticalAlignment>('center');
  const pixels = unit === 'font' ? height * 24 : height;
  const changeUnit = (next: typeof unit) => {
    setHeight(next === 'font' ? pixels / 24 : pixels);
    setUnit(next);
  };
  const sizingOptions = [
    {
      value: 'font' as const,
      label: 'Relative',
      tooltip: 'Scale with the layer font size',
      icon: <Type aria-hidden="true" />,
    },
    {
      value: 'document' as const,
      label: 'Fixed',
      tooltip: 'Keep a fixed document height',
      icon: <Ruler aria-hidden="true" />,
    },
  ];
  const sizing = sharedWrapper ? (
    <div
      role="group"
      aria-label="Graphic sizing"
      className="flex min-w-0 flex-1 items-center gap-1"
    >
      {sizingOptions.map((option) => (
        <Tooltip key={option.value} content={option.tooltip}>
          <button
            type="button"
            aria-label={option.label}
            aria-pressed={unit === option.value}
            onClick={() => changeUnit(option.value)}
            className={`control-segment flex h-9 min-w-0 flex-1 items-center justify-center gap-1 px-1 text-xs [&_svg]:size-4 ${unit === option.value ? 'control-selected' : ''}`}
          >
            {option.icon}
            {option.label}
          </button>
        </Tooltip>
      ))}
    </div>
  ) : (
    <SegmentedControl
      label="Graphic sizing"
      value={unit}
      onValueChange={changeUnit}
      className="min-w-0 flex-1"
      options={sizingOptions.map((option) => ({
        ...option,
        content: (
          <>
            {option.icon} {option.label}
          </>
        ),
      }))}
    />
  );
  const valueField = (
    <Field
      label="Graphic height"
      hideLabel
      className="!space-y-0 min-w-0 flex-1"
    >
      {(id) => (
        <DimensionInput
          id={id}
          aria-label="Graphic height"
          value={height}
          onValueChange={setHeight}
          min={unit === 'font' ? 0.25 : 1}
          max={1e7}
          step={unit === 'font' ? 0.1 : 1}
          unit={unit === 'font' ? '×' : 'px'}
          stepperLabel="Graphic height"
        />
      )}
    </Field>
  );

  return (
    <section className="w-[340px] max-w-full space-y-3 rounded-xl bg-selected-element-base p-3 text-content-primary">
      <div className="grid grid-cols-[1rem_minmax(0,1fr)] items-center gap-2">
        <Tooltip content="Element height">
          <MoveVertical
            aria-label="Element height"
            className="size-4 text-content-secondary"
          />
        </Tooltip>
        {sharedWrapper ? (
          <div className="control-field flex min-w-0 items-center gap-1 p-1">
            {sizing}
            {valueField}
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-[minmax(0,1.15fr)_minmax(5rem,0.85fr)] items-center gap-2">
            {sizing}
            {valueField}
          </div>
        )}
      </div>
      <div className="grid grid-cols-[1rem_minmax(0,1fr)] items-center gap-2">
        <Tooltip content="Vertical alignment within the caption line">
          <UnfoldVertical
            aria-label="Vertical alignment"
            className="size-4 text-content-secondary"
          />
        </Tooltip>
        <SegmentedControl
          label="Vertical alignment"
          value={alignment}
          onValueChange={setAlignment}
          options={[
            {
              value: 'top',
              label: 'Top',
              content: <AlignVerticalJustifyStart aria-hidden="true" />,
            },
            {
              value: 'center',
              label: 'Center',
              content: <AlignVerticalJustifyCenter aria-hidden="true" />,
            },
            {
              value: 'bottom',
              label: 'Bottom',
              content: <AlignVerticalJustifyEnd aria-hidden="true" />,
            },
          ]}
        />
      </div>
    </section>
  );
}

const meta = {
  title: 'Proposals/GraphicSizeLayout',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Two interactive layout proposals for inline graphic sizing. Both keep the height icon before the sizing controls, in the same order, with alignment below.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const SharedWrapper: Story = {
  render: () => <SizeLayout sharedWrapper />,
  name: 'Sizing controls in one wrapper',
};

export const SeparateWrappers: Story = {
  render: () => <SizeLayout sharedWrapper={false} />,
  name: 'Sizing controls in separate wrappers',
};
