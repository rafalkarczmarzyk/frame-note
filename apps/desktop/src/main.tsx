import { appVersion } from '../../../packages/editor/src/lib/build-info';
import { createStartupAbout } from '../../../packages/editor/src/lib/startup-about';
import type { DesktopConfig } from '../../../packages/core/src/desktop-config';
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
      readConfiguration(
        quality: number,
      ): Promise<{ config: DesktopConfig; warning: string }>;
      writeConfiguration(
        patch: Partial<DesktopConfig>,
        settingsSave?: boolean,
      ): Promise<{ config: DesktopConfig; warning: string }>;
      revealConfiguration(): Promise<void>;
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
            | 'open'
            | 'export'
            | 'about'
            | 'settings'
            | 'check-updates'
            | 'undo'
            | 'redo',
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
let legacyQuality = 95;
try {
  legacyQuality = Number(localStorage.getItem('framenote.export-quality'));
} catch {
  /* Profile preferences may be unavailable. */
}
let configState = await desktop.readConfiguration(legacyQuality).catch(() => ({
  config: {
    version: 1 as const,
    exportQuality: 95,
    removeMetadata: true,
    historyLimit: 100,
    rememberWindow: false,
    checkUpdatesAtStartup: true,
  },
  warning: 'Configuration could not be initialized. Settings may not be saved.',
}));
const configListeners = new Set<() => void>();
configurePlatform({
  configuration: {
    current: () => configState.config,
    warning: () => configState.warning,
    async save(patch) {
      try {
        configState = await desktop.writeConfiguration(
          patch,
          'historyLimit' in patch,
        );
      } catch (error) {
        if (!configState.warning)
          configState = {
            ...configState,
            warning:
              'Could not save configuration. Changes have not been applied; check file permissions and retry in Settings.',
          };
        for (const changed of configListeners) changed();
        throw error;
      }
      for (const changed of configListeners) changed();
    },
    subscribe(changed) {
      configListeners.add(changed);
      return () => {
        configListeners.delete(changed);
      };
    },
    reveal: () => desktop.revealConfiguration(),
  },
  systemFonts: true,
  systemFontsError,
  ...browserPlatform,
  startupAbout: createStartupAbout(browserPlatform.storage, appVersion),
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
  onSettings: (show) =>
    desktop.onCommand((command) => {
      if (command === 'settings') show();
    }),
  onAbout: (show) =>
    desktop.onCommand((command) => {
      if (command === 'about') show();
    }),
});
desktop.onCommand((command) => {
  if (
    command === 'settings' ||
    command === 'about' ||
    command === 'undo' ||
    command === 'redo'
  )
    return;
  if (command === 'check-updates') {
    window.dispatchEvent(new Event('framenote-check-updates'));
    return;
  }
  if (document.querySelector('dialog[open]')) return;
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
