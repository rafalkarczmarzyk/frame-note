import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { SegmentedControl } from '../components/ui/segmented-control';
import type { Meta, StoryObj } from '@storybook/react-vite';
const meta = {
  title: 'Design/Tokens',
  parameters: {
    docs: {
      description: {
        component:
          'All HEX values live only in src/index.css. Named palette tokens feed semantic roles. UI uses the same CSS and local font files as the app. Focus, selected and disabled states belong to components, not feature-specific copies.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Palette: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-4">
      {[
        'charcoal-dark',
        'charcoal',
        'charcoal-light',
        'slate',
        'porcelain',
      ].map((name) => (
        <div key={name} className="overflow-hidden rounded-sm border">
          <div
            className="h-24"
            style={{ background: `var(--color-${name})` }}
          />
          <p className="p-3 text-xs">{name}</p>
        </div>
      ))}
    </div>
  ),
};
export const Typography: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs text-content-secondary">
          Display / Advercase
        </p>
        <h1 className="font-display text-5xl">Every frame has a story.</h1>
      </div>
      <div>
        <p className="mb-2 text-xs text-content-secondary">
          Interface / Montserrat
        </p>
        <p className="font-sans text-sm">
          Caption, typography, position and export.
        </p>
        <p className="mt-2 text-xs text-content-secondary">
          Supporting text, labels and metadata values.
        </p>
      </div>
    </div>
  ),
};

const surfaceGroups = [
  {
    title: 'Application',
    tokens: [
      'app-base',
      'header-base',
      'sidebar-base',
      'workspace-base',
      'accordion-base',
    ],
  },
  {
    title: 'Inputs',
    tokens: [
      'input-base',
      'input-hover',
      'input-text',
      'input-placeholder',
      'input-focus-ring',
      'input-unit',
    ],
  },
  {
    title: 'Buttons and segments',
    tokens: [
      'button-primary-base',
      'button-primary-hover',
      'button-secondary-base',
      'button-secondary-hover',
      'segment-base',
      'segment-selected',
      'segment-selected-hover',
    ],
  },
  {
    title: 'Panels and menus',
    tokens: [
      'panel-base',
      'panel-header-base',
      'panel-border',
      'menu-base',
      'menu-item-hover',
    ],
  },
  {
    title: 'Slider',
    tokens: [
      'slider-track',
      'slider-fill',
      'slider-thumb',
      'slider-thumb-drag',
      'slider-scale',
    ],
  },
  {
    title: 'Text and edges',
    tokens: [
      'content-primary',
      'content-secondary',
      'content-muted',
      'label',
      'border-subtle',
      'focus-ring',
    ],
  },
];
export const UsageTokens: Story = {
  render: () => (
    <div className="space-y-8">
      {surfaceGroups.map((group) => (
        <section key={group.title}>
          <h2 className="mb-3 font-display text-2xl">{group.title}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.tokens.map((name) => (
              <div key={name} className="flex items-center gap-3">
                <span
                  className="block size-10 shrink-0 rounded-lg border border-border-subtle"
                  style={{ background: `var(--${name})` }}
                />
                <code className="text-xs">{name}</code>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};
export const ControlSurfaces: Story = {
  render: () => (
    <div className="max-w-sm space-y-4 rounded-xl bg-accordion-base p-5">
      <h2 className="font-display text-xl text-accordion-label">
        Control surfaces
      </h2>
      <Input aria-label="Example input" placeholder="Input placeholder" />
      <Input aria-label="Disabled input" value="Disabled" disabled />
      <Textarea
        aria-label="Example textarea"
        defaultValue="Same input-base token"
        rows={3}
      />
      <SegmentedControl
        label="Example segments"
        value="one"
        onValueChange={() => {}}
        options={[
          { value: 'one', label: 'Selected' },
          { value: 'two', label: 'Other' },
        ]}
      />
      <div className="flex gap-3">
        <Button>Primary</Button>
        <Button variant="outline">Secondary</Button>
      </div>
    </div>
  ),
};
