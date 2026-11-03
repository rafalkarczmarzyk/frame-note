// SPDX-License-Identifier: GPL-3.0-or-later
import { cp, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { repositoryRoot } from './legal-materials.mjs';
import { verifyLegalMaterials } from './verify-legal-materials.mjs';

export async function stageDesktopLegal(stage) {
  verifyLegalMaterials(join(stage, 'renderer'));
  for (const [source, target] of [
    ['LICENSE', 'LICENSE'],
    ['LICENSING.md', 'LICENSING.md'],
    ['licenses/PHOTOGRAPHS.txt', 'PHOTOGRAPHS.txt'],
  ])
    await cp(join(repositoryRoot, source), join(stage, target));
  // Copy from the exact installed Electron distribution, not the npm wrapper.
  // A missing native notice must stop packaging before a distributable exists.
  const dist = join(repositoryRoot, 'node_modules/electron/dist');
  const electron = await readFile(join(dist, 'LICENSE'), 'utf8');
  const chromium = await readFile(join(dist, 'LICENSES.chromium.html'), 'utf8');
  if (!electron.includes('Permission') || !chromium.includes('<html'))
    throw Error('Invalid Electron/Chromium license material');
  const legal = join(stage, 'renderer/legal');
  await writeFile(join(legal, 'ELECTRON.txt'), electron);
  await writeFile(join(legal, 'CHROMIUM.html'), chromium);
  await writeFile(
    join(legal, 'native.json'),
    JSON.stringify(['ELECTRON.txt', 'CHROMIUM.html']),
  );
}
