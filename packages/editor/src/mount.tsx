import type { WindowChrome } from './components/layout/app-header';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
export function mountEditor({
  windowChrome = 'standard',
}: { windowChrome?: WindowChrome } = {}) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App windowChrome={windowChrome} />
    </StrictMode>,
  );
}
