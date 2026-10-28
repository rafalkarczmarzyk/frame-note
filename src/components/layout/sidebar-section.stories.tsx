import { Type, Move, TextQuote } from 'lucide-react';
import { PhotoIcon } from '../icons/photo-icon';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Textarea } from '../ui/textarea';
import { AnchorPicker, type AnchorValue } from '../ui/anchor-picker';
import { SidebarSection } from './sidebar-section';
import { NumberField } from '../ui/number-field';
const meta = {
  title: 'Components/UI/Accordion',
  component: SidebarSection,
  args: {
    id: 'storybook-section',
    title: 'Typography',
    icon: <Type />,
    iconTone: 'typography',
    children: (
      <NumberField
        label="Size"
        step={0.1}
        value={2}
        onValueChange={() => {}}
        min={0.01}
        max={20}
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        component:
          'Native details/summary. Independent sections keep their content mounted. Open state belongs to the current workspace and resets on reload.',
      },
    },
  },
} satisfies Meta<typeof SidebarSection>;
export default meta;
type Story = StoryObj<typeof meta>;
function AccordionGroup() {
  const [caption, setCaption] = useState('{exif:Artist}');
  const [size, setSize] = useState(2);
  const [anchor, setAnchor] = useState<AnchorValue>('bottom-left');
  return (
    <div className="w-full max-w-xs bg-app-base">
      <SidebarSection
        id="story-group-photo"
        title="Photo"
        iconTone="photo"
        icon={<PhotoIcon />}

        defaultOpen={false}
      >
        <p className="text-xs leading-5">
          20260520-IMG_3843.jpg
          <br />
          5964 × 3976 px
        </p>
      </SidebarSection>
      <SidebarSection
        id="story-group-caption"
        title="Caption"
        iconTone="caption"
        icon={<TextQuote />}
      >
        <Textarea
          aria-label="Caption template"
          rows={3}
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
        />
      </SidebarSection>
      <SidebarSection
        id="story-group-typography"
        title="Typography"
        iconTone="typography"
        icon={<Type />}
      >
        <NumberField
          label="Size (% short edge)"
          step={0.1}
          value={size}
          onValueChange={setSize}
          min={0.01}
          max={20}
        />
      </SidebarSection>
      <SidebarSection
        id="story-group-position"
        title="Position"
        iconTone="position"
        icon={<Move />}

        defaultOpen={false}
      >
        <AnchorPicker value={anchor} onValueChange={setAnchor} />
      </SidebarSection>
    </div>
  );
}

export const Default: Story = {
  render: () => <AccordionGroup />,
  parameters: {
    docs: {
      description: {
        story:
          'Multiple independent sections with editable content. Open several at once; collapsing a section preserves its values. This preview does not save preferences.',
      },
    },
  },
};
export const Open: Story = {};
export const Collapsed: Story = {
  args: { defaultOpen: false, id: 'storybook-collapsed' },
};

export const WithIcon: Story = { args: { icon: <Type /> } };

export const ContainerInspector: Story = {
  args: { title: 'Layer', surface: 'container' },
};
