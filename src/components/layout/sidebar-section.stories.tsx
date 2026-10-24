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
    summary: 'Montserrat, 1.35%',
    persist: false,
    children: (
      <NumberField
        label="Size"
        value={1.35}
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
          'Native details/summary. Independent sections keep their content mounted. Set persist=false for documentation or transient layouts; production uses localStorage.',
      },
    },
  },
} satisfies Meta<typeof SidebarSection>;
export default meta;
type Story = StoryObj<typeof meta>;
function AccordionGroup() {
  const [caption, setCaption] = useState('{exif:Artist}');
  const [size, setSize] = useState(1.35);
  const [anchor, setAnchor] = useState<AnchorValue>('bottom-left');
  return (
    <div className="w-full max-w-xs overflow-hidden rounded-xl border bg-background">
      <SidebarSection
        id="story-group-photo"
        title="Photo"
        summary="5964 × 3976 px"
        defaultOpen={false}
        persist={false}
      >
        <p className="text-xs leading-5">
          20260520-IMG_3843.jpg
          <br />
          5964 × 3976 px
        </p>
      </SidebarSection>
      <SidebarSection id="story-group-caption" title="Caption" persist={false}>
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
        summary={`Montserrat, ${size}%`}
        persist={false}
      >
        <NumberField
          label="Size (% short edge)"
          value={size}
          onValueChange={setSize}
          min={0.01}
          max={20}
        />
      </SidebarSection>
      <SidebarSection
        id="story-group-position"
        title="Position"
        summary={anchor.replaceAll('-', ' ')}
        defaultOpen={false}
        persist={false}
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
