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
      {['charcoal', 'slate', 'porcelain', 'tropical-mint'].map((name) => (
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
        <p className="mb-2 text-xs text-foreground/70">Display / Advercase</p>
        <h1 className="font-display text-5xl">Every frame has a story.</h1>
      </div>
      <div>
        <p className="mb-2 text-xs text-foreground/70">
          Interface / Montserrat
        </p>
        <p className="font-sans text-sm">
          Caption, typography, position and export.
        </p>
        <p className="mt-2 text-xs text-foreground/70">
          Supporting text, labels and metadata values.
        </p>
      </div>
    </div>
  ),
};
