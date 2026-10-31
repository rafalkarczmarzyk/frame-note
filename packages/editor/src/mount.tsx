import type { Platform } from './lib/platform-context';
import { PlatformProvider } from './components/platform-provider';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
export function mountEditor({ platform }: { platform: Platform }) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <PlatformProvider platform={platform}>
        <App />
      </PlatformProvider>
    </StrictMode>,
  );
}
