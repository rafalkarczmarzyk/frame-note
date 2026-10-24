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
        order: ['Design', 'Components', ['UI', 'Layout', 'Brand'], 'Screens'],
      },
    },
    controls: { expanded: true },
    a11y: { test: 'todo' },
  },
  decorators: [
    (Story, context) => (
      <div
        className={
          context.parameters.layout === 'fullscreen'
            ? 'relative isolate h-dvh min-h-0 overflow-hidden bg-background font-sans text-foreground'
            : 'min-h-24 bg-background p-4 font-sans text-foreground'
        }
      >
        <Story />
      </div>
    ),
  ],
};
export default preview;
