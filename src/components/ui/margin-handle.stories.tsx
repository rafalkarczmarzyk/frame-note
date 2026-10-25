import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { MarginHandle, type MarginHandleProps } from './margin-handle';
import { MarginTooltip } from './margin-tooltip';

/** A tiny controlled host: one handle, no ruler, guide, image or shared context. */
function HandleExample(args: MarginHandleProps) {
  const [value, setValue] = useState(args.value);
  const [hovered, hover] = useState(false);
  const [focused, focus] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ coordinate: number; value: number } | null>(null);
  const horizontal = args.side === 'left' || args.side === 'right';
  const direction = args.side === 'right' || args.side === 'bottom' ? -1 : 1;
  const active =
    !args.disabled && (args.active || hovered || focused || dragging);
  const position = args.position + direction * (value - args.value) * 4;
  const finish = (cancel = false) => {
    if (cancel && drag.current) setValue(drag.current.value);
    drag.current = null;
    setDragging(false);
  };
  const update = (next: number) =>
    setValue(Math.min(args.max, Math.max(0, Math.round(next * 10) / 10)));
  return (
    <div className="p-8">
      <div
        className="relative rounded-md border bg-workspace-base"
        style={{
          width: horizontal ? 440 : 140,
          height: horizontal ? 140 : 440,
        }}
      >
        <div
          className="absolute"
          style={
            horizontal
              ? { left: 20, top: 28, width: 400, height: 28 }
              : { left: 28, top: 20, width: 28, height: 400 }
          }
        >
          <MarginHandle
            {...args}
            value={value}
            position={position}
            active={active}
            showLabel={args.showLabel || active}
            onMouseEnter={() => hover(true)}
            onMouseLeave={() => hover(false)}
            onFocus={() => focus(true)}
            onBlur={() => focus(false)}
            onPointerDown={(event) => {
              if (event.button !== 0 || args.disabled) return;
              event.preventDefault();
              event.currentTarget.focus({ preventScroll: true });
              event.currentTarget.setPointerCapture(event.pointerId);
              drag.current = {
                coordinate: horizontal ? event.clientX : event.clientY,
                value,
              };
              setDragging(true);
            }}
            onPointerMove={(event) => {
              if (drag.current)
                update(
                  drag.current.value +
                    (direction *
                      ((horizontal ? event.clientX : event.clientY) -
                        drag.current.coordinate)) /
                      4,
                );
            }}
            onPointerUp={() => finish()}
            onPointerCancel={() => finish(true)}
            onLostPointerCapture={() => finish()}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                finish(true);
                event.currentTarget.blur();
                return;
              }
              const negative = horizontal ? 'ArrowLeft' : 'ArrowUp';
              const positive = horizontal ? 'ArrowRight' : 'ArrowDown';
              if (event.key === negative || event.key === positive) {
                event.preventDefault();
                update(
                  value + direction * (event.key === positive ? 0.1 : -0.1),
                );
              }
            }}
          />
        </div>
        {active && (
          <MarginTooltip
            side={args.side}
            value={value}
            unitLabel={args.unitLabel}
            style={
              horizontal
                ? {
                    left: 20 + position,
                    top: 70,
                    transform: 'translateX(-50%)',
                  }
                : { left: 65, top: 20 + position }
            }
          />
        )}
      </div>
      <output className="mt-3 block text-xs text-content-secondary">
        {value} {args.unitLabel}
        {dragging ? ' · Dragging' : ''}
      </output>
    </div>
  );
}
const meta = {
  title: 'Components/UI/MarginHandle',
  component: MarginHandle,
  args: {
    side: 'left',
    position: 160,
    value: 20,
    max: 100,
    unitLabel: '% S',
    active: false,
    showLabel: false,
    disabled: false,
  },
  argTypes: {
    side: { control: 'radio', options: ['left', 'right', 'top', 'bottom'] },
    position: { control: { type: 'range', min: 0, max: 400 } },
    value: { control: { type: 'range', min: 0, max: 100 } },
  },
  render: (args) => <HandleExample key={JSON.stringify(args)} {...args} />,
  parameters: {
    docs: {
      description: {
        component:
          'One production handle on an empty surface, without a ruler or photo. This is a controlled visual primitive; the small story host supplies value/drag handlers. The full MarginRulers stories cover document units, linking and cancellation. Hover or focus to reveal the letter and production tooltip; drag the 32 × 28 px target or use arrow keys.',
      },
    },
  },
} satisfies Meta<typeof MarginHandle>;
export default meta;
type Story = StoryObj<typeof meta>;
export const TriangleOnly: Story = {};
export const WithLetter: Story = { args: { showLabel: true } };
export const Active: Story = { args: { showLabel: true, active: true } };
export const Right: Story = { args: { side: 'right', showLabel: true } };
export const Top: Story = { args: { side: 'top', showLabel: true } };
export const Bottom: Story = { args: { side: 'bottom', showLabel: true } };
export const HoverAndTooltip: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole('slider');
    await userEvent.hover(handle);
    await expect(canvas.getByRole('tooltip')).toHaveTextContent(
      'Left margin · 20 % S',
    );
  },
};
export const KeyboardFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole('slider');
    handle.focus();
    await waitFor(() => expect(canvas.getByRole('tooltip')).toBeVisible());
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(handle).toHaveAttribute('aria-valuenow', '20.1'),
    );
  },
};
export const Drag: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Drag this single handle. Its tooltip follows the changing value. Escape restores the value from the start of the drag.',
      },
    },
  },
};
export const Disabled: Story = {
  args: { disabled: true, showLabel: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('slider')).toBeDisabled();
    await userEvent.hover(canvas.getByRole('slider'));
    await expect(canvas.queryByRole('tooltip')).not.toBeInTheDocument();
  },
};
export const LargeValue: Story = {
  args: { value: 1234.56789, max: 5000, unitLabel: 'px', active: true },
};
