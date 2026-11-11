import type { ZoomSetting } from '@/features/photo/navigator-state';
import { PhotoZoomSlider } from '@/features/photo/photo-zoom-slider';
import { HistoryControls } from '@/features/photo/history-controls';
import { Download } from 'lucide-react';
import { PhotoActions } from '@/features/photo/photo-actions';
import { expect, userEvent, within } from 'storybook/test';
import { useCallback, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppHeader } from './app-header';
import { PlatformProvider } from '../platform-provider';
import type { Platform } from '@/lib/platform-context';
import { Button } from '../ui/button';
import { PresetControls } from '@/features/presets/preset-controls';
import { configurePlatform, platform as currentPlatform } from '@/lib/platform';
import { builtinPresets } from '@/domain/builtin-presets';

function HeaderPreview({
  width = 1100,
  platform = 'web',
  recovery = false,
}: {
  width?: number;
  platform?: Platform;
  recovery?: boolean;
}) {
  const [toolbarHost, setToolbarHost] = useState<HTMLElement | null>(null);
  const [panelHost, setPanelHost] = useState<HTMLDivElement | null>(null);
  const [zoomSetting, setZoomSetting] = useState<ZoomSetting>(1);
  const [hasPhoto, setHasPhoto] = useState(true);
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState(() =>
    structuredClone(builtinPresets[0]!.layout),
  );
  const attach = useCallback((node: HTMLDivElement | null) => {
    setToolbarHost(node?.querySelector('#preset-actions') ?? null);
  }, []);
  return (
    <PlatformProvider platform={platform}>
      <div
        style={{ maxWidth: width }}
        className="min-h-96 bg-workspace-base text-content-primary"
        ref={attach}
      >
        <AppHeader
          zoomAction={
            <PhotoZoomSlider
              compact
              label="Toolbar zoom"
              scale={zoomSetting === 'fit' ? 0.5 : zoomSetting}
              fit={zoomSetting === 'fit'}
              photo={{ width: 1200, height: 800 }}
              viewport={{ width: 600, height: 400 }}
              disabled={!hasPhoto}
              onZoom={setZoomSetting}
            />
          }
          historyAction={
            <HistoryControls
              status={{
                canUndo: layout.containers.length === 0,
                canRedo: false,
                truncated: false,
                undoLabel: 'Edit layout',
              }}
              onUndo={() =>
                setLayout(structuredClone(builtinPresets[0]!.layout))
              }
              onRedo={() => {}}
            />
          }
          photoAction={
            <PhotoActions
              hasPhoto={hasPhoto}
              onOpen={() => setHasPhoto(true)}
              onClose={() => setHasPhoto(false)}
            />
          }
        >
          <Button size="sm" aria-label="Export JPG">
            <Download className="md:hidden" />
            <span className="hidden md:inline">Export JPG</span>
          </Button>
        </AppHeader>
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setLayout({ ...layout, containers: [] })}
          >
            Edit layout
          </Button>
          {open && <div ref={setPanelHost} className="h-[600px] w-80" />}
        </div>
        <PresetControls
          layout={layout}
          icons={[]}
          onApply={(preset) => setLayout(preset.layout)}
          persist={recovery}
          toolbarHost={toolbarHost}
          panelHost={open ? panelHost : null}
          onBrowse={() => setOpen(true)}
          onClose={() => setOpen(false)}
        />
      </div>
    </PlatformProvider>
  );
}

const meta = {
  title: 'Sidebar & panels/AppHeader',
  component: HeaderPreview,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof HeaderPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Presets: Story = {};
export const About: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole('button', { name: /^About$/ }),
    );
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('dialog'),
    ).toBeVisible();
  },
};
/** No toolbar logo; About is opened from the native FrameNote menu in Electron. */
export const MacOS: Story = {
  args: { width: 1440, platform: 'macos' },
};
export const MacOSMinimum: Story = {
  args: { width: 800, platform: 'macos' },
};
/** UI preparation only; packaging and native behavior require verification on each OS. */
export const Windows: Story = { args: { width: 1440, platform: 'windows' } };
export const Linux: Story = { args: { width: 1440, platform: 'linux' } };
export const Narrow: Story = {
  args: { width: 640 },
  play: async ({ canvasElement }) => {
    const zoom = within(canvasElement).getByRole('slider', {
      name: 'Toolbar zoom',
    });
    zoom.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(zoom).toHaveAttribute('aria-valuetext', '101%');
    await expect(
      within(canvasElement).queryByRole('button', { name: /^Zoom (in|out)$/ }),
    ).not.toBeInTheDocument();
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton', {
      name: 'Toolbar zoom percentage',
    });
    await userEvent.clear(input);
    await userEvent.type(input, '125');
    await userEvent.keyboard('{Enter}');
    await expect(zoom).toHaveAttribute('aria-valuetext', '125%');
    const presets = canvas.getByRole('button', { name: 'Zoom presets' });
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(presets);
    await userEvent.click(await page.findByRole('menuitem', { name: 'Fit' }));
    await expect(zoom).toHaveAttribute('aria-valuetext', '50%');
    await userEvent.click(presets);
    await userEvent.click(await page.findByRole('menuitem', { name: '100%' }));
    await expect(zoom).toHaveAttribute('aria-valuetext', '100%');
  },
};

export const LongNameAndModified: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await page.findByRole('button', { name: 'Save preset' }),
    );
    await userEvent.clear(await page.findByLabelText('Preset name'));
    await userEvent.click(await page.findByLabelText('Preset name'));
    await userEvent.paste(
      'Wildlife — long signature layout for landscape photographs',
    );
    await userEvent.click(page.getByRole('button', { name: 'Save' }));
    await userEvent.click(
      page.getByRole('button', { name: 'Close manage presets' }),
    );
    await userEvent.click(page.getByRole('button', { name: 'Edit layout' }));
    await expect(page.getByRole('status')).toHaveTextContent(/Modified|•/);
  },
};

export const PresetBrowser: Story = {
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

/** Isolated in-memory repository: never reads or changes the browser library. */
export const UnreadablePresets: Story = {
  beforeEach: () => {
    const previous = currentPlatform();
    let source = JSON.stringify([
      builtinPresets[0],
      { version: 2, name: 'Future preset' },
    ]);
    configurePlatform({
      ...previous,
      presets: {
        read: async () => source,
        write: async (value) => {
          source = value;
        },
      },
    });
    return () => configurePlatform(previous);
  },
  args: { recovery: true },
  play: PresetBrowser.play,
};
