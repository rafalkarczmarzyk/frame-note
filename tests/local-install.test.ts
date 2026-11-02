import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  symlink,
  writeFile,
  lstat,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// @ts-expect-error The installation helper is plain JavaScript.
import * as installer from '../scripts/local-install-desktop.mjs';
const { installLocalApp, inspectInstallTarget } = installer;

let root: string, source: string, directory: string, target: string;
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'framenote-install-test-'));
  source = join(root, 'source.app');
  directory = join(root, 'Applications');
  target = join(directory, 'FrameNote.app');
  await mkdir(source);
  await mkdir(directory);
  await writeFile(join(source, 'version'), 'new');
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});
const inspect = async (path: string) => {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
};
const options = () => ({ inspect, verify: vi.fn(), assertClosed: vi.fn() });
const oldApp = async () => {
  await mkdir(target);
  await writeFile(join(target, 'version'), 'old');
};
const version = () => readFile(join(target, 'version'), 'utf8');

it('installs and updates only the app, leaving neighboring data intact', async () => {
  await writeFile(join(directory, 'presets.json'), 'saved');
  await installLocalApp(source, directory, options());
  expect(await version()).toBe('new');
  await writeFile(join(source, 'version'), 'newer');
  await installLocalApp(source, directory, options());
  expect(await version()).toBe('newer');
  expect(await readFile(join(directory, 'presets.json'), 'utf8')).toBe('saved');
  expect((await readdir(directory)).sort()).toEqual([
    'FrameNote.app',
    'presets.json',
  ]);
});
it('leaves the old installation intact when staged verification fails', async () => {
  await oldApp();
  const config = options();
  config.verify
    .mockImplementationOnce(() => {})
    .mockImplementationOnce(() => {
      throw Error('bad signature');
    });
  await expect(installLocalApp(source, directory, config)).rejects.toThrow(
    'bad signature',
  );
  expect(await version()).toBe('old');
  expect(await readdir(directory)).toEqual(['FrameNote.app']);
});
it('refuses replacement if the app starts during the build or copy', async () => {
  await oldApp();
  const config = options();
  config.assertClosed
    .mockImplementationOnce(() => {})
    .mockImplementationOnce(() => {
      throw Error('running');
    });
  await expect(installLocalApp(source, directory, config)).rejects.toThrow(
    'running',
  );
  expect(await version()).toBe('old');
});
it('restores the previous app if replacement fails', async () => {
  await oldApp();
  const move = vi
    .fn()
    .mockImplementationOnce(rename)
    .mockRejectedValueOnce(Error('move failed'))
    .mockImplementationOnce(rename);
  await expect(
    installLocalApp(source, directory, { ...options(), move }),
  ).rejects.toThrow('move failed');
  expect(await version()).toBe('old');
  expect(await readdir(directory)).toEqual(['FrameNote.app']);
});
it('preserves the backup and reports its location when restoration also fails', async () => {
  await oldApp();
  const move = vi
    .fn()
    .mockImplementationOnce(rename)
    .mockRejectedValue(Error('move failed'));
  await expect(
    installLocalApp(source, directory, { ...options(), move }),
  ).rejects.toThrow('Previous app preserved at');
  const backup = (await readdir(directory)).find((name) =>
    name.startsWith('.framenote-install-'),
  )!;
  expect(
    await readFile(join(directory, backup, 'previous.app/version'), 'utf8'),
  ).toBe('old');
});
it('rejects a symlink without following it', async () => {
  await symlink(source, target);
  await expect(inspectInstallTarget(target)).rejects.toThrow('symlink');
  expect(await readFile(join(source, 'version'), 'utf8')).toBe('new');
});
it.skipIf(process.platform !== 'darwin')(
  'rejects another bundle identity',
  async () => {
    await mkdir(join(target, 'Contents'), { recursive: true });
    await writeFile(
      join(target, 'Contents/Info.plist'),
      '<?xml version="1.0"?><plist version="1.0"><dict><key>CFBundleIdentifier</key><string>other.app</string></dict></plist>',
    );
    await expect(inspectInstallTarget(target)).rejects.toThrow(
      'another application',
    );
  },
);
