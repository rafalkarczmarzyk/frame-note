import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PhotoLoadingIndicator } from './photo-loading-indicator';
import { Button } from '@/components/ui/button';
import photoUrl from '../../../tests/fixtures/20260405-K89A0565.jpg';

function PreviewSurface({
  children,
  narrow = false,
  photo = false,
}: {
  children: ReactNode;
  narrow?: boolean;
  photo?: boolean;
}) {
  return (
    <div
      className={`relative flex h-[420px] max-w-full items-center justify-center overflow-hidden bg-workspace-base ${narrow ? 'w-80' : 'w-[800px]'}`}
    >
      {photo && (
        <img
          src={photoUrl}
          alt="Photo behind the loading indicator"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {children}
    </div>
  );
}

const meta = {
  title: 'Components/UI/PhotoLoadingIndicator',
  component: PhotoLoadingIndicator,
  args: { label: 'Preparing preview…' },
  argTypes: {
    label: {
      control: 'text',
      description:
        'Visible loading message, also announced as a polite status.',
    },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The production photo loader: a centered card with a rotating 36 px spinner. Positioned absolutely inside its nearest positioned parent, without moving the underlying UI. Uses the shared glass material; reduced motion stops rotation. Edit this component to refine the loader used by the application. StartupRedesign/LoadingPreview shows the same component inside the full interface.',
      },
    },
  },
  render: (args) => (
    <PreviewSurface>
      <PhotoLoadingIndicator {...args} />
    </PreviewSurface>
  ),
} satisfies Meta<typeof PhotoLoadingIndicator>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const OpeningPhoto: Story = { args: { label: 'Opening photo…' } };
export const PreparingPreview: Story = {};
export const OnPhoto: Story = {
  render: (args) => (
    <PreviewSurface photo>
      <PhotoLoadingIndicator {...args} />
    </PreviewSurface>
  ),
};
export const Cancellable: Story = {
  args: { label: 'Adding photos · 3 of 12', onCancel: () => {} },
  render: (args) => (
    <PreviewSurface photo>
      <PhotoLoadingIndicator {...args} />
    </PreviewSurface>
  ),
};
export const Narrow: Story = {
  render: (args) => (
    <PreviewSurface narrow>
      <PhotoLoadingIndicator {...args} />
    </PreviewSurface>
  ),
};
export const LongMessage: Story = {
  args: {
    label: 'Preparing the photo preview and the first full-resolution JPG…',
  },
  render: (args) => (
    <PreviewSurface narrow>
      <PhotoLoadingIndicator {...args} />
    </PreviewSurface>
  ),
};

function TogglePreview({ label }: { label?: string }) {
  const [visible, setVisible] = useState(true);
  return (
    <div className="space-y-3">
      <Button size="sm" variant="outline" onClick={() => setVisible(!visible)}>
        {visible ? 'Hide loader' : 'Show loader'}
      </Button>
      <PreviewSurface photo>
        {visible && <PhotoLoadingIndicator label={label} />}
      </PreviewSurface>
    </div>
  );
}
export const ToggleVisibility: Story = {
  render: (args) => <TogglePreview {...args} />,
};
