import { afterEach, describe, expect, it } from 'vitest';
import {
  mkdtemp,
  readFile,
  writeFile,
  rm,
  mkdir,
  readdir,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ConfigFile } from '../apps/desktop/src/config-file.mts';
import {
  defaultDesktopConfig,
  parseDesktopConfig,
} from '../packages/core/src/desktop-config.ts';
const folders: string[] = [];
async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), 'framenote-config-'));
  folders.push(directory);
  return { directory, store: new ConfigFile(directory) };
}
afterEach(async () => {
  await Promise.all(
    folders
      .splice(0)
      .map((folder) => rm(folder, { recursive: true, force: true })),
  );
});
describe('desktop configuration v1', () => {
  it('defaults window restoration off while retaining an explicit saved choice', () => {
    expect(defaultDesktopConfig().rememberWindow).toBe(false);
    expect(parseDesktopConfig({ version: 1 }).rememberWindow).toBe(false);
    expect(
      parseDesktopConfig({ version: 1, rememberWindow: true }).rememberWindow,
    ).toBe(true);
  });
  it('reads the v1 fixture', async () => {
    const value = parseDesktopConfig(
      JSON.parse(
        await readFile(
          new URL('./fixtures/configuration/v1.json', import.meta.url),
          'utf8',
        ),
      ),
    );
    expect(value).toMatchObject({
      version: 1,
      historyLimit: 200,
      window: { x: -1800, displayId: 2 },
    });
  });
  it('backs up malformed JSON on explicit recovery but never replaces newer formats', async () => {
    const { directory, store } = await fixture();
    await writeFile(store.file, 'malformed');
    await store.load();
    expect(store.canReplace()).toBe(true);
    await store.update({ historyLimit: 8 }, true);
    const backup = (await readdir(directory)).find((name) =>
      name.endsWith('.backup'),
    )!;
    expect(await readFile(join(directory, backup), 'utf8')).toBe('malformed');
    expect(store.snapshot()).toMatchObject({
      config: { historyLimit: 8 },
      warning: '',
    });
    await writeFile(store.file, '{"version":2}');
    const newer = new ConfigFile(directory);
    await newer.load();
    expect(newer.canReplace()).toBe(false);
    await expect(newer.update({ historyLimit: 8 }, true)).rejects.toThrow(
      'newer configuration',
    );
    expect(await readFile(store.file, 'utf8')).toBe('{"version":2}');
  });
  it('requires the format marker and rejects invalid known types and ranges', () => {
    expect(parseDesktopConfig({ version: 1 })).toEqual(defaultDesktopConfig());
    for (const value of [
      {},
      { version: 2 },
      { version: 1, historyLimit: 0 },
      { version: 1, historyLimit: 1001 },
      { version: 1, historyLimit: 1.5 },
      { version: 1, removeMetadata: 'false' },
      { version: 1, exportQuality: 101 },
    ])
      expect(() => parseDesktopConfig(value)).toThrow();
  });
  it('migrates quality once, persists options and only reads external edits on restart', async () => {
    const { directory, store } = await fixture();
    await store.load();
    await store.initialize(75);
    await store.initialize(60);
    expect(store.snapshot().config.exportQuality).toBe(75);
    await Promise.all([
      store.update({ historyLimit: 8 }),
      store.update({ removeMetadata: false }),
      store.update({ checkUpdatesAtStartup: false }),
    ]);
    const restarted = new ConfigFile(directory);
    await restarted.load();
    expect(restarted.snapshot().config).toMatchObject({
      exportQuality: 75,
      historyLimit: 8,
      removeMetadata: false,
      checkUpdatesAtStartup: false,
    });
    await writeFile(
      store.file,
      JSON.stringify({ version: 1, historyLimit: 42 }),
    );
    expect(store.snapshot().config.historyLimit).toBe(8);
    await store.update({ rememberWindow: false });
    expect(JSON.parse(await readFile(store.file, 'utf8')).historyLimit).toBe(8);
    await writeFile(
      store.file,
      JSON.stringify({ version: 1, historyLimit: 42 }),
    );
    await restarted.load();
    expect(restarted.snapshot().config.historyLimit).toBe(42);
    expect(
      (await readdir(directory)).filter((name) => name.endsWith('.tmp')),
    ).toEqual([]);
  });
  it.each(['broken JSON', '{"version":2}', '{"version":1,"historyLimit":0}'])(
    'preserves unreadable/unsupported source: %s',
    async (source) => {
      const { store } = await fixture();
      await writeFile(store.file, source);
      expect((await store.load()).warning).toBeTruthy();
      await store.initialize(60);
      await expect(store.update({ historyLimit: 20 })).rejects.toThrow();
      expect(await readFile(store.file, 'utf8')).toBe(source);
      expect(store.snapshot().config).toEqual(defaultDesktopConfig());
    },
  );
  it('retains migrated quality when first creation fails and a later Save succeeds', async () => {
    const { store } = await fixture();
    await store.load();
    await mkdir(store.file);
    expect(await store.initialize(75)).toMatchObject({
      config: { exportQuality: 75 },
      warning: expect.any(String),
    });
    expect(store.snapshot().warning).not.toBe('');
    await rm(store.file, { recursive: true });
    await store.update({ historyLimit: 8 });
    expect(JSON.parse(await readFile(store.file, 'utf8'))).toMatchObject({
      exportQuality: 75,
      historyLimit: 8,
    });
    expect(store.snapshot().warning).toBe('');
  });
  it('does not apply a failed write and can retry', async () => {
    const { directory, store } = await fixture();
    await store.load();
    await store.initialize(95);
    await rm(store.file);
    await mkdir(store.file);
    await expect(store.update({ historyLimit: 4 })).rejects.toThrow();
    expect(store.snapshot().config.historyLimit).toBe(100);
    await rm(store.file, { recursive: true });
    await store.update({ historyLimit: 4 });
    expect(store.snapshot().config.historyLimit).toBe(4);
    expect(
      (await readdir(directory)).filter((name) => name.endsWith('.tmp')),
    ).toEqual([]);
  });
  it('retains unknown root/window settings through save and restart', async () => {
    const { directory, store } = await fixture();
    const window = {
      x: 10,
      y: 20,
      width: 900,
      height: 700,
      displayId: 1,
      maximized: false,
      future: { scale: 2 },
    };
    const future = { nested: [true, { mode: 'next' }] };
    await writeFile(store.file, JSON.stringify({ version: 1, future, window }));
    expect(await store.load()).toMatchObject({
      warning: '',
      config: { future, window },
    });
    await store.update({ historyLimit: 42 });
    const { future: ignored, ...knownWindow } = window;
    void ignored;
    await store.update({ window: { ...knownWindow, width: 1000 } });
    const expected = {
      version: 1,
      historyLimit: 42,
      future,
      window: { ...window, width: 1000 },
    };
    expect(JSON.parse(await readFile(store.file, 'utf8'))).toMatchObject(
      expected,
    );
    const restarted = new ConfigFile(directory);
    expect(await restarted.load()).toMatchObject({
      warning: '',
      config: expected,
    });
    expect(await readdir(directory)).toEqual(['config.json']);
    expect(() =>
      parseDesktopConfig({ version: 1, future, historyLimit: 'wrong' }),
    ).toThrow();
  });
});
