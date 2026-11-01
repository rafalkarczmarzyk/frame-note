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
      JSON.parse(await readFile(join(root, 'presets/name.json'), 'utf8')),
    ).toEqual(value);
    expect(JSON.parse(await new PresetFiles(root).read())).toEqual([value]);
    await files.write(JSON.stringify([{ ...value, name: 'Renamed' }]));
    expect(await readdir(join(root, 'presets'))).toEqual(['renamed.json']);
    await files.write('[]');
    expect(await readdir(join(root, 'presets'))).toEqual([]);
  });
  it('rejects invalid IDs, duplicates and future versions before touching existing files', async () => {
    const { root, files } = await setup();
    await files.read();
    await files.write(JSON.stringify([preset()]));
    const before = await readFile(join(root, 'presets/name.json'), 'utf8');
    for (const input of [
      [preset('../escape')],
      [preset(), preset()],
      [{ ...preset(), version: 2 }],
    ])
      await expect(files.write(JSON.stringify(input))).rejects.toThrow();
    expect(await readFile(join(root, 'presets/name.json'), 'utf8')).toBe(
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
  it('does not overwrite an unrelated directory and allocates a collision suffix', async () => {
    const { root, files } = await setup();
    await files.read();
    await mkdir(join(root, 'presets/name.json'));
    await files.write(JSON.stringify([preset()]));
    expect(await readdir(join(root, 'presets'))).toEqual([
      'name-2.json',
      'name.json',
    ]);
    expect(
      JSON.parse(await readFile(join(root, 'presets/name-2.json'), 'utf8')),
    ).toEqual(preset());
  });
});

it('renames only the explicitly saved legacy preset, even when its JSON is unchanged', async () => {
  const { root, files } = await setup();
  await mkdir(join(root, 'presets'), { recursive: true });
  const one = preset('one');
  const two = preset('two');
  await writeFile(join(root, 'presets/one.json'), JSON.stringify(one));
  await writeFile(join(root, 'presets/two.json'), JSON.stringify(two));
  await files.read();
  await files.write(JSON.stringify([one, two]), ['one']);
  expect((await readdir(join(root, 'presets'))).sort()).toEqual([
    'name.json',
    'two.json',
  ]);
  await files.write(JSON.stringify([one, two]), ['one']);
  expect((await readdir(join(root, 'presets'))).sort()).toEqual([
    'name.json',
    'two.json',
  ]);
});
it('keeps duplicate names separate across restart, update, rename and deletion', async () => {
  const { root, files } = await setup();
  await files.read();
  const one = preset('one');
  const two = preset('two');
  await files.write(JSON.stringify([one, two]));
  expect((await readdir(join(root, 'presets'))).sort()).toEqual([
    'name-2.json',
    'name.json',
  ]);
  const restarted = new PresetFiles(root);
  await restarted.read();
  two.layout.containers[0]!.template = 'Changed';
  await restarted.write(JSON.stringify([one, two]));
  expect((await readdir(join(root, 'presets'))).sort()).toEqual([
    'name-2.json',
    'name.json',
  ]);
  await restarted.write(JSON.stringify([two]));
  expect(await readdir(join(root, 'presets'))).toEqual(['name-2.json']);
});
it('rejects external modifications instead of overwriting them', async () => {
  const { root, files } = await setup();
  await files.read();
  const value = preset();
  await files.write(JSON.stringify([value]));
  const external = { ...value, name: 'External change' };
  await writeFile(join(root, 'presets/name.json'), JSON.stringify(external));
  await expect(
    files.write(JSON.stringify([{ ...value, name: 'Overwrite' }])),
  ).rejects.toThrow('changed on disk');
  expect(
    JSON.parse(await readFile(join(root, 'presets/name.json'), 'utf8')),
  ).toEqual(external);
});
