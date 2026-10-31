import { describe, expect, it } from 'vitest';
import { AsyncPresetStore } from './async-preset-store';
import { createPreset } from '../../../../core/src/presets';
import { createCaptionLayout } from '../../../../core/src/caption-layout';
const make = (id: string) => createPreset(id, id, createCaptionLayout(), []);
const validate = (name: string, svg: string) => ({ name, svg, aspect: 1 });
describe('async preset persistence', () => {
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
