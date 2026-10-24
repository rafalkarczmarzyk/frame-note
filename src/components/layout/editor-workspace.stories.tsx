import type { Meta, StoryObj } from '@storybook/react-vite';
import { EditorWorkspace, ToolSidebar } from './editor-workspace';
import { SidebarSection } from './sidebar-section';
const meta = {
  title: 'Components/Layout/ToolSidebar',
  component: ToolSidebar,
  args: {
    children: (
      <SidebarSection id="storybook-tools" title="Tools" persist={false}>
        <p className="text-xs">Feature controls live here.</p>
      </SidebarSection>
    ),
  },
  decorators: [
    (Story) => (
      <div className="flex h-96 border">
        <EditorWorkspace>
          <div className="flex-1 p-6 text-sm text-foreground/70">
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
