import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SettingsDialog } from './settings-dialog';
import { defaultDesktopConfig } from '../../../../core/src/desktop-config';
import { Button } from '@/components/ui/button';
function SettingsPreview({
  saveFails = false,
  savePending = false,
}: {
  saveFails?: boolean;
  savePending?: boolean;
}) {
  const [saved, setSaved] = useState(defaultDesktopConfig());
  const [open, setOpen] = useState(true);
  return (
    <div className="flex h-full items-center justify-center p-6">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open Settings
      </Button>
      {open && (
        <SettingsDialog
          initial={saved}
          onClose={() => setOpen(false)}
          onReveal={async () => {}}
          onSave={async (values) => {
            if (saveFails) throw Error('Simulated write failure');
            if (savePending) await new Promise<void>(() => {});
            setSaved({ ...saved, ...values });
          }}
        />
      )}
    </div>
  );
}
const meta = {
  title: 'Screens/DesktopSettings',
  component: SettingsPreview,
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, height: '900px' },
      description: {
        component:
          'Production desktop Settings dialog. One sectioned form with strong option labels, grouped surfaces and help in info tooltips. Uses NumberField with integer stepping and vertical drag, no unit. Native modal focus containment; X/Escape/Cancel discard, backdrop keeps the form open. Story callbacks simulate persistence and file reveal; reopen to inspect saved preview values. Restore defaults affects only this draft. Export controls remain outside Settings.',
      },
    },
  },
} satisfies Meta<typeof SettingsPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Form: Story = {};
export const SaveError: Story = {
  args: { saveFails: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /^Save$/ }));
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Could not save settings',
    );
  },
};
export const InvalidHistory: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton', {
      name: 'Undo steps per photo',
    });
    await userEvent.clear(input);
    await userEvent.type(input, '1.5');
    await userEvent.click(canvas.getByRole('button', { name: /^Save$/ }));
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Enter a whole number',
    );
  },
};

export const HistoryHelp: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('button', { name: 'About undo history' }).focus();
    await expect(await canvas.findByRole('tooltip')).toHaveTextContent(
      '1–1000',
    );
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByRole('dialog')).toBeVisible();
  },
};

export const Saving: Story = {
  args: { savePending: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /^Save$/ }));
    await expect(
      canvas.getByRole('button', { name: 'Close Settings' }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: /^Cancel$/ }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: 'Saving…' }),
    ).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByRole('dialog')).toBeVisible();
  },
};
