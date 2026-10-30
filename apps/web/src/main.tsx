import {
  browserPlatform,
  configurePlatform,
} from '../../../packages/editor/src/lib/platform';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../packages/editor/src/index.css';
import App from '../../../packages/editor/src/App.tsx';

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
      await desktop.saveFile(name, new Uint8Array(await blob.arrayBuffer()));
    },
  });
  desktop.onCommand((command) => {
    const selector =
      command === 'open'
        ? 'input[aria-label="Choose JPG or PNG photo"]'
        : 'button[aria-label="Export JPG"]';
    (document.querySelector(selector) as HTMLElement | null)?.click();
  });
  new MutationObserver(() =>
    desktop.setSessionOpen(
      !!document.querySelector('[data-photo-canvas] canvas'),
    ),
  ).observe(document.documentElement, { subtree: true, childList: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
