// SPDX-License-Identifier: GPL-3.0-or-later
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { legalFiles, digest, repositoryRoot } from './legal-materials.mjs';

export function verifyLegalMaterials(renderer) {
  const folder = join(renderer, 'legal');
  const read = (name) => readFileSync(join(folder, name), 'utf8');
  const components = JSON.parse(read('components.json'));
  if (!components.length) throw Error('Missing dependency notices');
  const expected = legalFiles(
    components.map((p) => join(repositoryRoot, p.directory)),
  );
  for (const [name, text] of Object.entries(expected))
    if (name !== 'native.json' && digest(read(name)) !== digest(text))
      throw Error('Stale or missing legal file: ' + name);
  return components;
}
