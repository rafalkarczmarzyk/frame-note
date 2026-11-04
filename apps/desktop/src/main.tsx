import { registerSystemFonts } from './system-fonts';
import type { SystemFontFace } from '../../../packages/core/src/system-fonts';
import {
  browserPlatform,
  configurePlatform,
} from '../../../packages/editor/src/lib/platform';
import { mountEditor } from '../../../packages/editor/src/mount';
import { getDesktopPlatform } from './platform.mts';

declare global {
  interface Window {
    frameNoteDesktop?: {
      platform: string;
      readSystemFonts(): Promise<SystemFontFace[]>;
      readPresets(): Promise<string>;
      writePresets(
        source: string,
        touchedIds?: readonly string[],
      ): Promise<void>;
      saveFile(name: string, bytes: Uint8Array): Promise<'saved' | 'cancelled'>;
      updateHistoryMenu(state: {
        canUndo: boolean;
        canRedo: boolean;
        undoLabel?: string;
        redoLabel?: string;
      }): void;
      onCommand(
        callback: (
          command:
            'open' | 'export' | 'about' | 'check-updates' | 'undo' | 'redo',
        ) => void,
      ): () => void;
    };
  }
}
const desktop = window.frameNoteDesktop;
if (!desktop) throw new Error('FrameNote desktop bridge is unavailable');
let systemFontsError: string | undefined;
try {
  registerSystemFonts(await desktop.readSystemFonts());
} catch {
  systemFontsError =
    'System fonts could not be read. Restart FrameNote to retry.';
}
configurePlatform({
  systemFonts: true,
  systemFontsError,
  ...browserPlatform,
  presets: {
    read: () => desktop.readPresets(),
    write: (source, touchedIds) => desktop.writePresets(source, touchedIds),
  },
  async saveFile(blob, name) {
    return desktop.saveFile(name, new Uint8Array(await blob.arrayBuffer()));
  },
  updateHistoryMenu: (state) => desktop.updateHistoryMenu(state),
  onHistoryCommand: (run) =>
    desktop.onCommand((command) => {
      if (command === 'undo' || command === 'redo') run(command);
    }),
  onAbout: (show) =>
    desktop.onCommand((command) => {
      if (command === 'about') show();
    }),
});
desktop.onCommand((command) => {
  if (command === 'about' || command === 'undo' || command === 'redo') return;
  if (command === 'check-updates') {
    window.dispatchEvent(new Event('framenote-check-updates'));
    return;
  }
  const selector =
    command === 'open'
      ? 'input[aria-label="Choose JPG or PNG photo"]'
      : 'button[aria-label="Export JPG"]';
  const elements = [...document.querySelectorAll<HTMLElement>(selector)];
  elements
    .find(
      (element) =>
        command === 'open' ||
        (element.offsetParent !== null &&
          !(element as HTMLButtonElement).disabled),
    )
    ?.click();
});
mountEditor({
  platform: getDesktopPlatform(desktop.platform),
});
