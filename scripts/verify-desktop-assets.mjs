import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import console from 'node:console';
async function verify(folder) {
  let count = 0;
  for (const entry of await readdir(`public/${folder}`, {
    withFileTypes: true,
  })) {
    const name = `${folder}/${entry.name}`;
    if (entry.isDirectory()) {
      count += await verify(name);
      continue;
    }
    const hash = async (path) =>
      createHash('sha256')
        .update(await readFile(path))
        .digest('hex');
    assert.equal(
      await hash(`apps/desktop/renderer/${name}`),
      await hash(`public/${name}`),
      `Asset differs: ${name}`,
    );
    count++;
  }
  return count;
}
console.log(
  `Verified ${await verify('fonts')} bundled font and license files against shared sources.`,
);
