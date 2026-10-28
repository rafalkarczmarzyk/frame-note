import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Copy, Download, Pencil, Save, Settings2 } from 'lucide-react';
import { SplitButton, type SplitButtonProps } from './split-button';

const items = [
  { label: 'Save as new', icon: <Save />, onSelect: () => {} },
  { label: 'Duplicate', icon: <Copy />, onSelect: () => {} },
  { label: 'Rename', icon: <Pencil />, onSelect: () => {} },
  {
    label: 'Manage presets',
    icon: <Settings2 />,
    separatorBefore: true,
    onSelect: () => {},
  },
];
const meta = {
  title: 'Components/UI/SplitButton',
  component: SplitButton,
  tags: ['autodocs'],
  args: {
    children: 'Save preset',
    menuLabel: 'Preset actions',
    items,
    onClick: () => {},
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'outline'] },
    size: { control: 'inline-radio', options: ['default', 'sm'] },
    color: {
      control: 'select',
      options: [
        'default',
        'violet',
        'turquoise',
        'yellow',
        'crimson',
        'rose-brown',
      ],
    },
    disabled: { control: 'boolean' },
    primaryDisabled: { control: 'boolean' },
    menuDisabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    items: { control: false },
    children: { control: 'text' },
    onClick: { control: false },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'An attached pair of buttons: the left segment runs the primary action; the arrow opens secondary actions without changing the primary action. Shares Button variants, palette and sizes. Each segment has its own focus target. Enter/Space opens the menu, Arrow Up/Down opens and navigates it, Home/End jumps, Escape returns focus, and Tab or an outside click dismisses it. Menu items can omit icons, be disabled, or start a new group. Native disabled fieldsets disable both segments. loading disables both; primaryDisabled and menuDisabled control each segment independently. The menu arrow is also disabled when all menu items are disabled or the list is empty. className styles the outer group; native button props (including ref, type and form) belong to the primary action. Give icon-only content an aria-label and always provide menuLabel.',
      },
    },
  },
} satisfies Meta<typeof SplitButton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Primary: Story = {
  args: {
    children: (
      <>
        <Save />
        Save preset
      </>
    ),
  },
};
export const Outline: Story = {
  args: {
    variant: 'outline',
    children: (
      <>
        <Save />
        Save preset
      </>
    ),
  },
};
export const Small: Story = { args: { size: 'sm', variant: 'outline' } };
export const SizesAndVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      {(['default', 'outline'] as const).flatMap((variant) =>
        (['default', 'sm'] as const).map((size) => (
          <SplitButton
            {...args}
            key={`${variant}-${size}`}
            variant={variant}
            size={size}
          >
            {variant} · {size}
          </SplitButton>
        )),
      )}
    </div>
  ),
};
export const Palette: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-4">
      {(
        [
          'default',
          'violet',
          'turquoise',
          'yellow',
          'crimson',
          'rose-brown',
        ] as const
      ).map((color) => (
        <SplitButton {...args} key={color} color={color}>
          {color}
        </SplitButton>
      ))}
    </div>
  ),
};
export const Disabled: Story = { args: { disabled: true } };
export const PrimaryDisabled: Story = {
  args: { primaryDisabled: true, variant: 'outline' },
};
export const MenuDisabled: Story = { args: { menuDisabled: true } };
export const AllItemsDisabled: Story = {
  args: {
    items: [{ label: 'Export all', disabled: true, onSelect: () => {} }],
  },
};
export const DisabledFieldset: Story = {
  render: (args) => (
    <fieldset disabled>
      <legend className="mb-3 text-xs text-content-secondary">
        Disabled form group
      </legend>
      <SplitButton {...args} />
    </fieldset>
  ),
};
export const Loading: Story = { args: { loading: true, children: 'Saving…' } };
export const IconOnly: Story = {
  args: {
    children: <Save aria-hidden="true" />,
    'aria-label': 'Save preset',
    title: 'Save preset',
    size: 'sm',
    variant: 'outline',
  },
};
export const FullWidth: Story = {
  args: { fullWidth: true },
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
};
export const LongLabel: Story = {
  args: {
    fullWidth: true,
    children: (
      <span className="truncate">
        Save changes to the wildlife landscape signature preset
      </span>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-64 max-w-full">
        <Story />
      </div>
    ),
  ],
};
export const Narrow: Story = {
  args: { fullWidth: true, size: 'sm', variant: 'outline' },
  decorators: [
    (Story) => (
      <div className="w-40">
        <Story />
      </div>
    ),
  ],
};
export const MixedMenuItems: Story = {
  args: {
    items: [
      items[0]!,
      {
        label: 'Rename (built-in preset)',
        icon: <Pencil />,
        disabled: true,
        onSelect: () => {},
      },
      {
        label: 'Action without icon',
        separatorBefore: true,
        onSelect: () => {},
      },
    ],
  },
};
export const EmptyMenu: Story = { args: { items: [] } };
export const NearWindowEdge: Story = {
  decorators: [
    (Story) => (
      <div className="flex min-h-72 items-end justify-end">
        <Story />
      </div>
    ),
  ],
};
function InteractiveExample(args: SplitButtonProps) {
  const [lastAction, setLastAction] = useState('No action yet');
  return (
    <div className="space-y-4">
      <SplitButton
        {...args}
        onClick={() => setLastAction('Saved current preset')}
        items={items.map((item) => ({
          ...item,
          onSelect: () => setLastAction(item.label),
        }))}
      />
      <p role="status" className="text-xs text-content-secondary">
        {lastAction}
      </p>
    </div>
  );
}
export const Interactive: Story = {
  render: (args) => <InteractiveExample {...args} />,
};
function SubmitExample(args: SplitButtonProps) {
  const [submits, setSubmits] = useState(0);
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmits(submits + 1);
      }}
    >
      <SplitButton
        {...args}
        type="submit"
        onClick={undefined}
        items={[
          { label: 'Download draft', icon: <Download />, onSelect: () => {} },
        ]}
      />
      <p role="status" className="text-xs text-content-secondary">
        Primary action submits: {submits}. Opening the menu does not submit.
      </p>
    </form>
  );
}
export const FormSubmit: Story = {
  render: (args) => <SubmitExample {...args} />,
};
