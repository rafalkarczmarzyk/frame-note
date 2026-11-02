import { afterEach, expect, it, vi } from 'vitest';
import {
  mkdtemp,
  readFile,
  readdir,
  rm,
  link,
  unlink,
  rename,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { PresetFiles } from '../../../apps/desktop/src/preset-files';
import { createPreset } from './presets';
import { createCaptionLayout } from './caption-layout';

vi.mock('node:fs/promises', async (original) => {
  const fs = await original<typeof import('node:fs/promises')>();
  return {
    ...fs,
    link: vi.fn(fs.link),
    unlink: vi.fn(fs.unlink),
    rename: vi.fn(fs.rename),
  };
});
const fs =
  await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
const roots: string[] = [];
afterEach(async () => {
  vi.mocked(link).mockImplementation(fs.link);
  vi.mocked(unlink).mockImplementation(fs.unlink);
  vi.mocked(rename).mockImplementation(fs.rename);
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});
async function setup() {
  const root = await mkdtemp(join(tmpdir(), 'framenote-failure-'));
  roots.push(root);
  const files = new PresetFiles(root);
  await files.read();
  const value = createPreset('one', 'Original', createCaptionLayout(), []);
  await files.write(JSON.stringify([value]));
  return { root: join(root, 'presets'), files, value };
}
it('rolls back a newly published filename when removing the previous filename fails, then retries', async () => {
  const { root, files, value } = await setup();
  const next = JSON.stringify([{ ...value, name: 'Renamed' }]);
  vi.mocked(unlink).mockImplementationOnce(async () => {
    throw Error('Cannot remove original');
  });
  await expect(files.write(next)).rejects.toThrow('Cannot remove original');
  expect(await readdir(root)).toEqual(['original.json']);
  expect(
    JSON.parse(await readFile(join(root, 'original.json'), 'utf8')),
  ).toEqual(value);
  await files.write(next);
  expect(await readdir(root)).toEqual(['renamed.json']);
});
it('restores an earlier atomic update if a later publish fails and preserves the collision', async () => {
  const { root, files, value } = await setup();
  const changed = structuredClone(value);
  changed.layout.containers[0]!.template = 'Changed';
  const second = { ...value, id: 'two', name: 'Collision' };
  vi.mocked(link).mockImplementation(async (source, destination) => {
    if (basename(String(destination)) === 'collision.json') {
      await fs.writeFile(destination, 'external file', { flag: 'wx' });
      throw Error('Exclusive publish collision');
    }
    return fs.link(source, destination);
  });
  await expect(files.write(JSON.stringify([changed, second]))).rejects.toThrow(
    'collision',
  );
  expect(
    JSON.parse(await readFile(join(root, 'original.json'), 'utf8')),
  ).toEqual(value);
  expect(await readFile(join(root, 'collision.json'), 'utf8')).toBe(
    'external file',
  );
  expect((await readdir(root)).filter((file) => file.endsWith('.tmp'))).toEqual(
    [],
  );
});

it('retains recovery copies if the rollback itself fails', async () => {
  const { root, files, value } = await setup();
  const changed = structuredClone(value);
  changed.layout.containers[0]!.template = 'Changed';
  const second = { ...value, id: 'two', name: 'Second' };
  vi.mocked(link).mockImplementation(async (source, destination) => {
    if (basename(String(destination)) === 'second.json')
      throw Error('Publish failed');
    return fs.link(source, destination);
  });
  let replacements = 0;
  vi.mocked(rename).mockImplementation(async (source, destination) => {
    if (
      basename(String(destination)) === 'original.json' &&
      ++replacements === 2
    )
      throw Error('Rollback failed');
    return fs.rename(source, destination);
  });
  await expect(files.write(JSON.stringify([changed, second]))).rejects.toThrow(
    'recovery copies remain',
  );
  const backups = (await readdir(root)).filter((file) => file.endsWith('.tmp'));
  expect(backups.length).toBeGreaterThan(0);
  const copies = await Promise.all(
    backups.map(async (file) =>
      JSON.parse(await readFile(join(root, file), 'utf8')),
    ),
  );
  expect(copies).toContainEqual(value);
});
