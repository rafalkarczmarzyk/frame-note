import type { Meta, StoryObj } from '@storybook/react-vite';
import { SidebarSection } from './sidebar-section';
import { NumberField } from '../ui/number-field';
const meta = {
  title: 'Components/Layout/SidebarSection',
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
export const Open: Story = {};
export const Collapsed: Story = {
  args: { defaultOpen: false, id: 'storybook-collapsed' },
};
