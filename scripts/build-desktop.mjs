// SPDX-FileCopyrightText: 2026 Rafał Karczmarzyk
// SPDX-License-Identifier: GPL-3.0-or-later
import { build as buildAdapter } from 'esbuild';
import { build as buildRenderer } from 'vite';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { packageDirectory, legalFiles } from './legal-materials.mjs';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

await buildRenderer({
  configFile: fileURLToPath(new URL('../vite.config.ts', import.meta.url)),
  mode: 'desktop',
});

const adapter = await buildAdapter({
  absWorkingDir: repositoryRoot,
  entryPoints: ['apps/desktop/src/preset-files.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: 'apps/desktop/preset-files.cjs',
  metafile: true,
});
const updateAdapter = await buildAdapter({
  absWorkingDir: repositoryRoot,
  entryPoints: ['apps/desktop/update-check.cjs'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: 'release/desktop-build/update-check.cjs',
  metafile: true,
});
await mkdir(join(repositoryRoot, 'release/desktop-build'), { recursive: true });
const legalFolder = join(repositoryRoot, 'apps/desktop/renderer/legal');
const components = JSON.parse(
  await readFile(join(legalFolder, 'components.json'), 'utf8'),
);
const directories = [
  ...components.map((p) => resolve(repositoryRoot, p.directory)),
  ...[
    ...Object.keys(adapter.metafile.inputs),
    ...Object.keys(updateAdapter.metafile.inputs),
  ]
    .filter((file) => file.includes('node_modules/'))
    .map((file) => packageDirectory(resolve(repositoryRoot, file))),
];
for (const [name, text] of Object.entries(legalFiles(directories)))
  await writeFile(join(legalFolder, name), text);
