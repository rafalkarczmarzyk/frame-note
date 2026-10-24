import { themes } from 'storybook/theming';
import type { Preview } from '@storybook/react-vite';
import '../src/index.css';
const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: { theme: themes.dark },
    options: {
      storySort: {
        order: ['Foundations', 'Atoms', 'Molecules', 'Layout', 'Compositions'],
      },
    },
    controls: { expanded: true },
    a11y: { test: 'todo' },
  },
  decorators: [
    (Story) => (
      <div className="min-h-24 bg-background p-4 font-sans text-foreground">
        <Story />
      </div>
    ),
  ],
};
export default preview;
