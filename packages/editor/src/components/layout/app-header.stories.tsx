import { Download } from 'lucide-react';
import { PhotoActions } from '@/features/photo/photo-actions';
import { expect, userEvent, within } from 'storybook/test';
import { useCallback, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppHeader, type WindowChrome } from './app-header';
import { Button } from '../ui/button';
import { PresetControls } from '@/features/presets/preset-controls';
import { builtinPresets } from '@/domain/builtin-presets';

function HeaderPreview({
  width = 1100,
  windowChrome = 'standard',
}: {
  width?: number;
  windowChrome?: WindowChrome;
}) {
  const [toolbarHost, setToolbarHost] = useState<HTMLElement | null>(null);
  const [panelHost, setPanelHost] = useState<HTMLDivElement | null>(null);
  const [hasPhoto, setHasPhoto] = useState(true);
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState(() =>
    structuredClone(builtinPresets[0]!.layout),
  );
  const attach = useCallback((node: HTMLDivElement | null) => {
    setToolbarHost(node?.querySelector('#preset-actions') ?? null);
  }, []);
  return (
    <div
      style={{ maxWidth: width }}
      className="min-h-96 bg-workspace-base text-content-primary"
      ref={attach}
    >
      <AppHeader
        windowChrome={windowChrome}
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
        persist={false}
        toolbarHost={toolbarHost}
        panelHost={open ? panelHost : null}
        onBrowse={() => setOpen(true)}
        onClose={() => setOpen(false)}
      />
    </div>
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
/** No toolbar logo; About is opened from the native FrameNote menu in Electron. */
export const MacOS: Story = {
  args: { width: 1440, windowChrome: 'macos-titlebar' },
};
export const MacOSMinimum: Story = {
  args: { width: 800, windowChrome: 'macos-titlebar' },
};
export const Narrow: Story = { args: { width: 640 } };

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
