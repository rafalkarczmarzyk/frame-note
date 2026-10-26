import type { Meta, StoryObj } from '@storybook/react-vite';
import { Info, Palette } from 'lucide-react';
import { Tooltip } from './tooltip';
import { IconButton } from './icon-button';
import { Button } from './button';

const meta = {
  title: 'Components/UI/Tooltip',
  component: Tooltip,
  args: {
    content: 'Color palette',
    children: (
      <IconButton label="Color palette">
        <Palette />
      </IconButton>
    ),
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-64 items-center justify-center gap-4 rounded-xl bg-accordion-base p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const LongHelp: Story = {
  args: {
    content:
      'Choose a color for the active layer. Changes appear immediately in your photograph and are included in the exported image.',
    children: (
      <IconButton label="Color help">
        <Info />
      </IconButton>
    ),
  },
};
export const WithExistingDescription: Story = {
  render: () => (
    <div>
      <p id="tooltip-story-description" className="mb-4 text-xs">
        This description remains linked when the tooltip opens.
      </p>
      <Tooltip content="Save the current layout for another photograph.">
        <Button aria-describedby="tooltip-story-description">
          Save preset
        </Button>
      </Tooltip>
    </div>
  ),
};
export const ViewportEdges: Story = {
  parameters: { layout: 'fullscreen' },
  decorators: [
    () => (
      <div className="fixed inset-0 bg-app-base">
        {[
          'top-2 left-2',
          'top-2 right-2',
          'bottom-2 left-2',
          'bottom-2 right-2',
        ].map((position) => (
          <div key={position} className={`absolute ${position}`}>
            <Tooltip content="Longer help stays within the window and flips below the control when needed.">
              <IconButton label={`Help ${position}`}>
                <Info />
              </IconButton>
            </Tooltip>
          </div>
        ))}
      </div>
    ),
  ],
};
