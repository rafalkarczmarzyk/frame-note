import {
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
  mkdir,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { PresetFiles } from '../../../apps/desktop/src/preset-files';
import { createPreset } from './presets';
import { createCaptionLayout } from './caption-layout';
const roots: string[] = [];
async function setup() {
  const root = await mkdtemp(join(tmpdir(), 'framenote-presets-'));
  roots.push(root);
  return { root, files: new PresetFiles(root) };
}
const preset = (id = 'test') =>
  createPreset(id, 'Name', createCaptionLayout(), []);
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((r) => rm(r, { recursive: true, force: true })),
  );
});
describe('macOS preset files', () => {
  it('creates a library and preserves the identical v1 JSON after restart and rename', async () => {
    const { root, files } = await setup();
    expect(await files.read()).toBe('[]');
    const value = preset();
    await files.write(JSON.stringify([value]));
    expect(
      JSON.parse(await readFile(join(root, 'presets/test.json'), 'utf8')),
    ).toEqual(value);
    expect(JSON.parse(await new PresetFiles(root).read())).toEqual([value]);
    await files.write(JSON.stringify([{ ...value, name: 'Renamed' }]));
    expect(await readdir(join(root, 'presets'))).toEqual(['test.json']);
    await files.write('[]');
    expect(await readdir(join(root, 'presets'))).toEqual([]);
  });
  it('rejects invalid IDs, duplicates and future versions before touching existing files', async () => {
    const { root, files } = await setup();
    await files.read();
    await files.write(JSON.stringify([preset()]));
    const before = await readFile(join(root, 'presets/test.json'), 'utf8');
    for (const input of [
      [preset('../escape')],
      [preset(), preset()],
      [{ ...preset(), version: 2 }],
    ])
      await expect(files.write(JSON.stringify(input))).rejects.toThrow();
    expect(await readFile(join(root, 'presets/test.json'), 'utf8')).toBe(
      before,
    );
  });
  it('reports unreadable input and leaves it untouched', async () => {
    const { root, files } = await setup();
    await files.read();
    const name = join(root, 'presets/broken.json');
    await writeFile(name, '{broken');
    await expect(new PresetFiles(root).read()).rejects.toThrow();
    expect(await readFile(name, 'utf8')).toBe('{broken');
  });
  it('reports a failed write without marking it saved, and can retry', async () => {
    const { root, files } = await setup();
    await files.read();
    const collision = join(root, 'presets/test.json');
    await mkdir(collision);
    await expect(files.write(JSON.stringify([preset()]))).rejects.toThrow();
    expect(
      (await readdir(join(root, 'presets'))).filter((f) => f.endsWith('.tmp')),
    ).toEqual([]);
    await rm(collision, { recursive: true });
    await files.write(JSON.stringify([preset()]));
    expect(JSON.parse(await new PresetFiles(root).read())).toEqual([preset()]);
  });
});
