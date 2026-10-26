import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PhotoActions } from './photo-actions';

const meta = {
  title: 'Components/UI/PhotoActions',
  component: PhotoActions,
  args: { hasPhoto: false, onOpen: () => {}, onClose: () => {} },
} satisfies Meta<typeof PhotoActions>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const PhotoLoaded: Story = { args: { hasPhoto: true } };
export const Importing: Story = { args: { hasPhoto: true, loading: true } };
export const Interactive: Story = {
  render: function Interactive() {
    const [hasPhoto, setHasPhoto] = useState(false);
    return (
      <div className="flex flex-col items-start gap-4">
        <PhotoActions
          hasPhoto={hasPhoto}
          onOpen={() => setHasPhoto(true)}
          onClose={() => setHasPhoto(false)}
        />
        <p role="status">{hasPhoto ? 'Photo loaded' : 'No photo'}</p>
      </div>
    );
  },
};
