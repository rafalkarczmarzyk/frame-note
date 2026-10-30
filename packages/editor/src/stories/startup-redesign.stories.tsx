import { userEvent, within } from 'storybook/test';
import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Meta, StoryObj } from '@storybook/react-vite';
import App from '@/App';
import { PhotoLoadingIndicator } from '@/features/photo/photo-loading-indicator';
import { PhotoDropOverlay } from '@/features/photo/photo-drop-overlay';

const meta = {
  title: 'Proposals/StartupRedesign',
  component: App,
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, height: '800px' },
      description: {
        component:
          'Production empty editor. The empty canvas shows a photo import action, drop guidance and privacy note, with version and links at the bottom. Choose a photo or drop a JPG/PNG to enter the editor. No modal, timer or dismiss action. The app logo is passive.',
      },
    },
  },
} satisfies Meta<typeof App>;
export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyEditor: Story = {};
export const DraggingPhoto: Story = {
  render: () => <CanvasOverlayPreview kind="drop" />,
};
export const CompactWindow: Story = {
  decorators: [
    (Story) => (
      <div className="h-[600px] max-w-[960px] overflow-hidden [&>div]:h-full">
        <Story />
      </div>
    ),
  ],
};

function CanvasOverlayPreview({ kind }: { kind: 'loading' | 'drop' }) {
  const [canvas, setCanvas] = useState<HTMLElement | null>(null);
  const attach = useCallback((node: HTMLDivElement | null) => {
    setCanvas(node?.querySelector('[data-photo-canvas]') ?? null);
  }, []);
  return (
    <div ref={attach}>
      <App />
      {canvas &&
        createPortal(
          kind === 'drop' ? <PhotoDropOverlay /> : <PhotoLoadingIndicator />,
          canvas,
        )}
    </div>
  );
}
export const LoadingPreview: Story = {
  render: () => <CanvasOverlayPreview kind="loading" />,
};

export const PresetsBeforePhoto: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await page.findByRole('button', { name: 'Preset actions' }),
    );
    await userEvent.click(
      await page.findByRole('menuitem', { name: 'Manage presets' }),
    );
  },
};
