import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  EditorWorkspace,
  ToolSidebar,
  ToolSidebarFooter,
} from './editor-workspace';
import { Button } from '@/components/ui/button';
import { SidebarSection } from './sidebar-section';
const meta = {
  title: 'Sidebar & panels/ToolSidebar',
  component: ToolSidebar,
  args: {
    children: (
      <SidebarSection id="storybook-tools" title="Tools">
        <p className="text-xs">Feature controls live here.</p>
      </SidebarSection>
    ),
  },
  decorators: [
    (Story) => (
      <div className="flex h-96 border">
        <EditorWorkspace>
          <div className="flex-1 p-6 text-sm text-content-secondary">
            Viewport fills the remaining space.
          </div>
          <Story />
        </EditorWorkspace>
      </div>
    ),
  ],
} satisfies Meta<typeof ToolSidebar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};

export const FixedFooter: Story = {
  args: {
    children: (
      <>
        <div className="min-h-0 flex-1 overflow-y-auto pb-20">
          {Array.from({ length: 6 }, (_, index) => (
            <SidebarSection
              key={index}
              id={`footer-demo-${index}`}
              title={`Tools ${index + 1}`}
            >
              <p className="text-xs text-content-secondary">
                Scroll the tools. Footer actions stay visible.
              </p>
            </SidebarSection>
          ))}
        </div>
        <ToolSidebarFooter>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              Copy settings
            </Button>
            <Button variant="outline" size="sm" disabled>
              Paste settings
            </Button>
          </div>
        </ToolSidebarFooter>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'ToolSidebarFooter is a glass overlay above the scrolling content. Bottom padding lets the final controls scroll fully above it. Uses the shared glass material, with an opaque fallback for reduced transparency.',
      },
    },
  },
};
