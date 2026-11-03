// SPDX-License-Identifier: GPL-3.0-or-later
import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { digest, repositoryRoot } from './legal-materials.mjs';

export function verifyPackagedLegal(resources) {
  const archive = join(resources, 'app.asar');
  const require = createRequire(import.meta.url);
  const asar = existsSync(archive)
    ? createRequire(require.resolve('@electron/packager'))('@electron/asar')
    : null;
  const read = (name) =>
    asar
      ? asar.extractFile(archive, name)
      : readFileSync(join(resources, 'app', name));
  for (const [source, destination] of [
    ['LICENSE', 'LICENSE'],
    ['LICENSING.md', 'LICENSING.md'],
    ['licenses/PHOTOGRAPHS.txt', 'PHOTOGRAPHS.txt'],
    ['LICENSE', 'renderer/legal/LICENSE.txt'],
    ['node_modules/electron/dist/LICENSE', 'renderer/legal/ELECTRON.txt'],
    [
      'node_modules/electron/dist/LICENSES.chromium.html',
      'renderer/legal/CHROMIUM.html',
    ],
    [
      'apps/desktop/renderer/legal/THIRD_PARTY_NOTICES.txt',
      'renderer/legal/THIRD_PARTY_NOTICES.txt',
    ],
    [
      'apps/desktop/renderer/legal/components.json',
      'renderer/legal/components.json',
    ],
  ])
    if (
      digest(read(destination)) !==
      digest(readFileSync(join(repositoryRoot, source)))
    )
      throw Error('Packaged license differs: ' + destination);
}
