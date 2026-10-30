import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, type BadgeTone } from './badge';
import { Check, Tag } from 'lucide-react';

const tones: BadgeTone[] = [
  'muted',
  'neutral',
  'warning',
  'error',
  'accent',
  'inverse',
];
const meta = {
  title: 'Selection & feedback/Badge',
  component: Badge,
  args: { children: 'SVG', tone: 'muted', size: 'sm' },
  argTypes: {
    tone: { control: 'select', options: tones },
    size: { control: 'select', options: ['sm', 'md', 'token'] },
  },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Colors: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {tones.map((tone) => (
        <Badge key={tone} tone={tone}>
          {tone}
        </Badge>
      ))}
    </div>
  ),
};
export const ApplicationExamples: Story = {
  render: () => (
    <div className="max-w-80 space-y-5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span>FrameNote logo</span>
        <Badge>SVG</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge tone="warning" size="md">
          author
        </Badge>
        <Badge tone="error" size="md">
          unknown:field
        </Badge>
        <Badge tone="neutral" size="md">
          icon:missing
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {(['neutral', 'warning', 'error'] as const).map((tone) => (
          <Badge key={tone} tone={tone} size="token">
            <Tag className="size-3" aria-hidden="true" />
            author
          </Badge>
        ))}
      </div>
      <Badge>
        <Check className="size-3.5" aria-hidden="true" />
        Selected
      </Badge>
      <Badge tone="error" size="md" className="break-all">
        exif:VeryLongMetadataFieldWithoutSpacesThatMustWrapInANarrowPanel
      </Badge>
    </div>
  ),
};
export const AsChild: Story = {
  render: () => (
    <Badge asChild tone="warning" size="token">
      <span data-example="editor-wrapper">
        <Tag className="size-3" aria-hidden="true" />
        author
      </span>
    </Badge>
  ),
};
