import { readFile, writeFile } from 'node:fs/promises';
import { readPreset } from './preset-node';

const paths = process.argv.slice(2);
if (!paths.length)
  throw Error('Usage: node scripts/convert-preset.mjs <preset.json> [...]');
for (const path of paths) {
  const preset = readPreset(await readFile(path, 'utf8'));
  const destination = path.replace(/\.json$/iu, '') + '.v2.json';
  await writeFile(destination, JSON.stringify(preset, null, 2) + '\n', {
    flag: 'wx',
  });
  console.log(destination);
}
