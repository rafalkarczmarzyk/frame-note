import { cp, mkdir, rm } from 'node:fs/promises';
await rm('apps/desktop/renderer', { recursive: true, force: true });
await mkdir('apps/desktop/renderer', { recursive: true });
await cp('apps/web/dist', 'apps/desktop/renderer', { recursive: true });
