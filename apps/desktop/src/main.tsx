import {
  browserPlatform,
  configurePlatform,
} from '../../../packages/editor/src/lib/platform';
import { mountEditor } from '../../../packages/editor/src/mount';

declare global {
  interface Window {
    frameNoteDesktop?: {
      saveFile(name: string, bytes: Uint8Array): Promise<'saved' | 'cancelled'>;
      setSessionOpen(value: boolean): void;
      onCommand(callback: (command: 'open' | 'export') => void): () => void;
    };
  }
}
const desktop = window.frameNoteDesktop;
if (desktop) {
  configurePlatform({
    ...browserPlatform,
    async saveFile(blob, name) {
      return desktop.saveFile(name, new Uint8Array(await blob.arrayBuffer()));
    },
  });
  desktop.onCommand((command) => {
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
  let reported = false;
  new MutationObserver(() => {
    const open = !!document.querySelector('[data-photo-canvas] canvas');
    if (open !== reported) {
      reported = open;
      desktop.setSessionOpen(open);
    }
  }).observe(document.documentElement, { subtree: true, childList: true });
}

mountEditor();
