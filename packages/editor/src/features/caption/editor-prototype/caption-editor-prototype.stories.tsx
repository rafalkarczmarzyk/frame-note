import type { Meta, StoryObj } from '@storybook/react-vite';
import { TokenContext } from '../editor/token-context';
import { CaptionEditorPrototype } from './caption-editor-prototype';

const meta = {
  title: 'Proposals/CaptionEditorPrototype',
  component: CaptionEditorPrototype,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CaptionEditorPrototype>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};

export const MetadataValueStates: Story = {
  decorators: [
    (Story) => (
      <TokenContext.Provider
        value={{
          values: {
            author: '',
            camera: 'Canon EOS R5',
            aperture: 'ƒ/8',
          },
        }}
      >
        <Story />
      </TokenContext.Provider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Neutral badges have values; author is a recognized helper without a value (yellow); missing is an unknown token (red). Missing icons retain their existing treatment.',
      },
    },
  },
};
