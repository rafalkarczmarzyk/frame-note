import { readFileSync } from 'node:fs';
import { readPreset } from '../../../../../scripts/preset-node';
import { describe, expect, it } from 'vitest';
import { AsyncPresetStore } from './async-preset-store';
import { createPreset } from '../../../../core/src/presets';
import { createCaptionLayout } from '../../../../core/src/caption-layout';
const make = (id: string) => createPreset(id, id, createCaptionLayout(), []);
const validate = (name: string, svg: string) => ({ name, svg, aspect: 1 });
describe('async preset persistence', () => {
  it('identifies an explicit save with unchanged JSON without touching other presets', async () => {
    let touched: readonly string[] | undefined;
    const store = new AsyncPresetStore(
      {
        read: async () => JSON.stringify([make('one'), make('two')]),
        write: async (_source, ids) => {
          touched = ids;
        },
      },
      validate,
    );
    await store.ready;
    await store.commit((current) =>
      current.map((preset) =>
        preset.id === 'one' ? structuredClone(preset) : preset,
      ),
    );
    expect(touched).toEqual(['one']);
  });
  it('serializes overlapping saves against the latest committed collection', async () => {
    let source = '[]';
    const store = new AsyncPresetStore(
      {
        read: async () => source,
        write: async (s) => {
          await Promise.resolve();
          source = s;
        },
      },
      validate,
    );
    await store.ready;
    await Promise.all(
      ['one', 'two'].map((id) =>
        store.commit((latest) => [...latest, make(id)]),
      ),
    );
    expect(store.presets.map((p) => p.id)).toEqual(['one', 'two']);
    expect(JSON.parse(source)).toEqual(store.presets);
  });
  it('does not publish a failed write and allows the next attempt', async () => {
    let fail = true;
    const store = new AsyncPresetStore(
      {
        read: async () => '[]',
        write: async () => {
          if (fail) throw Error('Disk full');
        },
      },
      validate,
    );
    await store.ready;
    await expect(store.commit(() => [make('one')])).rejects.toThrow(
      'Disk full',
    );
    expect(store.presets).toEqual([]);
    fail = false;
    await store.commit(() => [make('two')]);
    expect(store.presets.map((p) => p.id)).toEqual(['two']);
  });
});

describe('partial library recovery', () => {
  it('preserves rejected entries across import, rename, update, delete and reload', async () => {
    const rejected = [
      { version: 2, name: 'Future', original: 'keep' },
      { ...make('one'), name: 'Duplicate' },
    ];
    let source = JSON.stringify([make('one'), ...rejected]);
    const repository = {
      read: async () => source,
      write: async (value: string) => {
        source = value;
      },
    };
    const store = new AsyncPresetStore(repository, validate);
    await store.ready;
    expect(store.issues).toEqual([
      expect.stringContaining('Future'),
      expect.stringContaining('Duplicate preset identifier'),
    ]);
    await store.commit((current) => [...current, make('imported')]);
    await store.commit((current) =>
      current.map((p) => (p.id === 'imported' ? { ...p, name: 'Renamed' } : p)),
    );
    await store.commit((current) =>
      current.map((p) =>
        p.id === 'imported'
          ? {
              ...p,
              layout: {
                ...p.layout,
                margins: { top: 9, right: 9, bottom: 9, left: 9 },
              },
            }
          : p,
      ),
    );
    await store.commit((current) => current.filter((p) => p.id !== 'imported'));
    expect(JSON.parse(source)).toEqual([make('one'), ...rejected]);
    const reload = new AsyncPresetStore(repository, validate);
    await reload.ready;
    expect(reload.presets).toEqual([make('one')]);
    expect(reload.issues).toHaveLength(2);
    expect(JSON.parse(store.original!)).toEqual([make('one'), ...rejected]);
  });
  it.each(['{broken', '{}', 'null'])(
    'protects an unreadable collection: %s',
    async (source) => {
      let writes = 0;
      const store = new AsyncPresetStore(
        {
          read: async () => source,
          write: async () => {
            writes++;
          },
        },
        validate,
      );
      await store.ready;
      await expect(store.commit(() => [make('new')])).rejects.toThrow(
        'blocked',
      );
      expect(writes).toBe(0);
      expect(store.original).toBe(source);
    },
  );
  it('retains rejected data when a write fails and subsequent saves overlap', async () => {
    const bad = { name: 'Keep' };
    let source = JSON.stringify([bad]);
    let fail = true;
    const store = new AsyncPresetStore(
      {
        read: async () => source,
        write: async (value) => {
          if (fail) throw Error('quota');
          source = value;
        },
      },
      validate,
    );
    await store.ready;
    await expect(store.commit(() => [make('failed')])).rejects.toThrow('quota');
    expect(store.presets).toEqual([]);
    expect(JSON.parse(source)).toEqual([bad]);
    fail = false;
    await Promise.all(
      ['a', 'b'].map((id) => store.commit((current) => [...current, make(id)])),
    );
    expect(JSON.parse(source)).toEqual([make('a'), make('b'), bad]);
  });
});

it('loads and persists the frozen official v1 through the async repository', async () => {
  const fixture = readPreset(
    readFileSync('tests/fixtures/presets/v1.json', 'utf8'),
  );
  let source = JSON.stringify([fixture]);
  const validateAsset = (name: string, svg: string) =>
    readPreset(
      JSON.stringify({ ...fixture, icons: [{ name, svg, aspect: 1 }] }),
    ).icons[0]!;
  const repository = {
    read: async () => source,
    write: async (value: string) => {
      source = value;
    },
  };
  const store = new AsyncPresetStore(repository, validateAsset);
  await store.ready;
  expect(store.presets).toEqual([fixture]);
  await store.commit((current) => [...current, make('new')]);
  const reload = new AsyncPresetStore(repository, validateAsset);
  await reload.ready;
  expect(reload.presets[0]).toEqual(fixture);
  expect(reload.warning).toBe('');
});
