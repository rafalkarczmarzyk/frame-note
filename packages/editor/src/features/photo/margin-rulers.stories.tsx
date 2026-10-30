import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { MarginRulers } from './margin-rulers';
import { MarginPreviewProvider } from '@/components/ui/margin-preview-provider';
import { MarginEditor } from '@/components/ui/margin-editor';
import {
  pixelsPerUnit,
  sizingLabels,
  type Margins,
  type MarginLinkMode,
  type SizingUnit,
} from '../../../../core/src/sizing';

type State = 'rest' | 'ruler' | 'handle' | 'focus';
type ExampleProps = {
  width: number;
  height: number;
  scale: number;
  unit: SizingUnit;
  margins: Margins;
  linkMode: MarginLinkMode;
  disabled: boolean;
  withInput?: boolean;
  initialState?: State;
};
const defaults: ExampleProps = {
  width: 6000,
  height: 4000,
  scale: 0.08,
  unit: 'short-edge',
  margins: { top: 3, right: 3, bottom: 3, left: 3 },
  linkMode: 'none',
  disabled: false,
};

function ExampleContent({
  width,
  height,
  scale,
  unit,
  margins: initialMargins,
  linkMode: initialLinkMode,
  disabled,
  withInput,
  initialState = 'rest',
}: ExampleProps) {
  const [margins, setMargins] = useState(initialMargins);
  const [linkMode, setLinkMode] = useState(initialLinkMode);
  const host = useRef<HTMLDivElement>(null);
  const dimensions = { width, height };
  useEffect(() => {
    const root = host.current;
    if (!root || initialState === 'rest') return;
    const target =
      initialState === 'ruler'
        ? root.querySelector('[role="group"]')
        : root.querySelector('[aria-label="Left margin"]');
    // Seed real component events once for the side-by-side comparison.
    if (initialState === 'focus')
      (target as HTMLElement | null)?.focus({ preventScroll: true });
    else target?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  }, [initialState]);
  return (
    <div ref={host} className="flex flex-wrap items-start gap-4">
      <div className="max-w-full overflow-auto rounded-lg border bg-workspace-base">
        <div
          className="relative"
          style={{ width: width * scale + 56, height: height * scale + 56 }}
        >
          <div
            aria-label="Neutral photo area"
            className="absolute flex bg-content-primary"
            style={{
              left: 28,
              top: 28,
              width: width * scale,
              height: height * scale,
            }}
          >
            <div className="h-full w-1/2 bg-workspace-base" />
          </div>
          <MarginRulers
            dimensions={dimensions}
            unit={unit}
            margins={margins}
            linkMode={linkMode}
            scale={scale}
            x={28}
            y={28}
            disabled={disabled}
            onChange={setMargins}
          />
        </div>
      </div>
      {withInput && (
        <div className="w-72 rounded-lg bg-sidebar-base p-4">
          <MarginEditor
            value={margins}
            linkMode={linkMode}
            unit={unit}
            unitLabel={sizingLabels[unit]}
            dimensions={dimensions}
            disabled={disabled}
            onChange={(next, mode) => {
              setMargins(next);
              setLinkMode(mode);
            }}
          />
        </div>
      )}
      <output
        aria-label="Margin values"
        className="w-full text-xs text-content-secondary"
      >
        Top {Number(margins.top.toFixed(6))} · Right{' '}
        {Number(margins.right.toFixed(6))} · Bottom{' '}
        {Number(margins.bottom.toFixed(6))} · Left{' '}
        {Number(margins.left.toFixed(6))} ({sizingLabels[unit]})
      </output>
    </div>
  );
}
function Example(props: ExampleProps) {
  // Changing Controls starts a fresh, predictable local editing session.
  return (
    <MarginPreviewProvider key={JSON.stringify(props)}>
      <ExampleContent {...props} />
    </MarginPreviewProvider>
  );
}
function Card({ title, ...props }: Partial<ExampleProps> & { title: string }) {
  return (
    <section aria-label={title} className="min-w-0 space-y-3">
      <h2 className="text-sm font-semibold">{title}</h2>
      <Example {...defaults} {...props} />
    </section>
  );
}
const meta = {
  title: 'Position & margins/MarginRulers',
  component: Example,
  subcomponents: { MarginRulers },
  args: defaults,
  argTypes: {
    width: { control: { type: 'number', min: 100, max: 12000, step: 100 } },
    height: { control: { type: 'number', min: 100, max: 12000, step: 100 } },
    scale: { control: { type: 'range', min: 0.01, max: 0.15, step: 0.01 } },
    unit: { control: 'select', options: ['px', 'short-edge', 'long-edge'] },
    linkMode: { control: 'radio', options: ['none', 'pairs', 'all'] },
    margins: { control: 'object' },
    disabled: { control: 'boolean' },
    withInput: { control: 'boolean' },
    initialState: { table: { disable: true } },
  },
  render: (args) => <Example {...args} />,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Production rulers on a neutral light/dark surface. Every example has independent local state; drag the handles, use arrow keys (Shift ×10), or Escape to cancel a drag. Playground Controls replace the initial state. No photo loading, captions, export or persistence.',
      },
    },
  },
} satisfies Meta<ExampleProps>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const InteractionStates: Story = {
  render: () => (
    <div className="grid items-start gap-6 xl:grid-cols-2">
      <Card title="Rest — triangles and dimmed rulers" scale={0.055} />
      <Card
        title="Ruler hover — badges and guides"
        scale={0.055}
        initialState="ruler"
      />
      <Card
        title="Handle hover — highlighted edge"
        scale={0.055}
        initialState="handle"
      />
      <Card
        title="Keyboard focus — focus ring and guides"
        scale={0.055}
        initialState="focus"
      />
    </div>
  ),
};
export const LinkModes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      {(['none', 'pairs', 'all'] as const).map((mode) => (
        <Card
          key={mode}
          title={mode}
          linkMode={mode}
          scale={0.05}
          initialState="handle"
        />
      ))}
    </div>
  ),
};
export const Units: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      {(['px', 'short-edge', 'long-edge'] as const).map((unit) => {
        const inset = 120 / pixelsPerUnit(unit, { width: 6000, height: 4000 });
        return (
          <Card
            key={unit}
            title={sizingLabels[unit]}
            unit={unit}
            margins={{ top: inset, right: inset, bottom: inset, left: inset }}
            scale={0.05}
            initialState="ruler"
          />
        );
      })}
    </div>
  ),
};
export const Geometry: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      <Card
        title="Landscape · asymmetric"
        scale={0.065}
        margins={{ top: 4, right: 12, bottom: 8, left: 6 }}
      />
      <Card title="Portrait" width={4000} height={6000} scale={0.065} />
      <Card title="Small preview" scale={0.025} />
    </div>
  ),
};
export const Limits: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      <Card
        title="Zero — handles on photo edges"
        scale={0.05}
        margins={{ top: 0, right: 0, bottom: 0, left: 0 }}
        initialState="ruler"
      />
      <Card
        title="Paired — one pixel of inner height"
        scale={0.05}
        linkMode="pairs"
        margins={{ top: 49.9875, bottom: 49.9875, left: 3, right: 3 }}
        initialState="ruler"
      />
      <Card
        title="Nearby handles — narrow inner area"
        scale={0.05}
        margins={{ top: 3, bottom: 3, left: 74, right: 74 }}
        initialState="ruler"
      />
    </div>
  ),
};
export const WithMarginInput: Story = { args: { withInput: true } };
export const Disabled: Story = { args: { disabled: true, withInput: true } };

export const HoverAndFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ruler = canvas.getByRole('group', {
      name: /Horizontal margin ruler/,
    });
    const handle = canvas.getByRole('slider', { name: 'Left margin' });
    const badge = handle.querySelector('span')!;
    await expect(ruler).toHaveStyle({ opacity: '0.6' });
    await expect(badge).not.toBeVisible();
    await userEvent.hover(ruler);
    await expect(ruler).toHaveStyle({ opacity: '1' });
    await waitFor(() => expect(badge).toBeVisible());
    await userEvent.unhover(ruler);
    await expect(badge).not.toBeVisible();
    await userEvent.hover(handle);
    await expect(canvas.queryByRole('tooltip')).not.toBeInTheDocument();
    await userEvent.unhover(handle);
    handle.focus();
    await waitFor(() => expect(badge).toBeVisible());
    await expect(handle).toHaveAttribute('aria-valuetext', '3 % S');
  },
};
export const DragAndCancel: Story = {
  args: { linkMode: 'pairs' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const left = canvas.getByRole('slider', { name: 'Left margin' });
    const right = canvas.getByRole('slider', { name: 'Right margin' });
    const box = left.getBoundingClientRect();
    // userEvent has no browser-owned pointer, so capture is covered separately
    // by the real-pointer E2E test. Keep the production drag handlers here.
    const capture = left.setPointerCapture;
    left.setPointerCapture = () => {};
    try {
      await userEvent.pointer({
        target: left,
        keys: '[MouseLeft>]',
        coords: { clientX: box.x + 16, clientY: box.y + 14 },
      });
      fireEvent.pointerMove(left, {
        pointerId: 1,
        clientX: box.x + 48,
        clientY: box.y + 14,
      });
      await waitFor(() =>
        expect(Number(left.getAttribute('aria-valuenow'))).toBeGreaterThan(3),
      );
      await expect(right).toHaveAttribute(
        'aria-valuenow',
        left.getAttribute('aria-valuenow')!,
      );
      await userEvent.keyboard('{Escape}');
      await userEvent.pointer({ target: left, keys: '[/MouseLeft]' });
      await expect(left).toHaveAttribute('aria-valuenow', '3');
      await expect(right).toHaveAttribute('aria-valuenow', '3');
    } finally {
      left.setPointerCapture = capture;
    }
  },
};
export const InputAndReset: Story = {
  args: { withInput: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton', { name: 'Left' });
    const handle = canvas.getByRole('slider', { name: 'Left margin' });
    await userEvent.clear(input);
    await userEvent.type(input, '8');
    await userEvent.tab();
    await expect(handle).toHaveAttribute('aria-valuenow', '8');
    handle.focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(input).toHaveValue(8.1));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Reset margins' }),
    );
    await expect(handle).toHaveAttribute('aria-valuenow', '3');
    await expect(input).toHaveValue(3);
  },
};
