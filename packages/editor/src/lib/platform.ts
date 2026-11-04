import type {
  DesktopConfig,
  SettingsValues,
} from '../../../core/src/desktop-config';
import type { PresetRepository } from '../features/presets/async-preset-store';
/** Platform services are installed once by the application entry point. */
export interface PlatformServices {
  startupAbout?: { readonly show: boolean; markShown(): void };
  configuration?: {
    current(): DesktopConfig;
    warning(): string;
    save(
      values: Partial<SettingsValues> & {
        exportQuality?: number;
        removeMetadata?: boolean;
      },
    ): Promise<void>;
    subscribe(changed: () => void): () => void;
    reveal(): Promise<void>;
  };
  onSettings?: (show: () => void) => () => void;
  onHistoryCommand?: (run: (direction: 'undo' | 'redo') => void) => () => void;
  updateHistoryMenu?: (state: {
    canUndo: boolean;
    canRedo: boolean;
    undoLabel?: string;
    redoLabel?: string;
  }) => void;
  systemFonts?: boolean;
  systemFontsError?: string;
  saveFile(
    blob: Blob,
    name: string,
  ): Promise<'download-started' | 'saved' | 'cancelled'>;
  storage: Pick<Storage, 'getItem' | 'setItem'>;
  presets?: PresetRepository;
  /** Subscribe to an About action supplied by a native application menu. */
  onAbout?: (show: () => void) => () => void;
}
export const browserPlatform: PlatformServices = {
  async saveFile(blob, name) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
    return 'download-started';
  },
  storage: {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
  },
};
let services = browserPlatform;
export function configurePlatform(platform: PlatformServices) {
  services = platform;
}
export function platform() {
  return services;
}
