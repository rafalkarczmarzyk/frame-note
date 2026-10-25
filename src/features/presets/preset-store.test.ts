import { describe, expect, it } from 'vitest';
import { PresetStore } from './preset-store';
import {
  createPreset,
  copyPresetName,
  parsePreset,
} from '../../domain/presets';
import { createCaptionLayout } from '../../domain/caption-layout';
const validate = (name: string, svg: string) => ({ name, svg, aspect: 1 });
const preset = (id: string, name = id) =>
  createPreset(id, name, createCaptionLayout(), []);
function storage(source = '[]') {
  let value = source;
  return {
    getItem: () => value,
    setItem: (_key: string, next: string) => {
      value = next;
    },
  };
}
describe('preset commit boundary', () => {
  it('preserves invalid entries while allowing valid entries to be updated', () => {
    const bad = { name: 'broken', original: 'keep me' };
    const port = storage(JSON.stringify([preset('one'), bad]));
    const store = new PresetStore(port, validate);
    expect(store.presets.map((p) => p.id)).toEqual(['one']);
    expect(store.warning).toContain('preserved');
    store.commit((current) => [...current, preset('two')]);
    expect(JSON.parse(port.getItem())).toContainEqual(bad);
    expect(new PresetStore(port, validate).presets).toHaveLength(2);
  });
  it('blocks overwriting a malformed collection and keeps a recovery copy', () => {
    const port = storage('{broken');
    const store = new PresetStore(port, validate);
    expect(() => store.commit(() => [preset('one')])).toThrow('blocked');
    expect(port.getItem()).toBe('{broken');
    expect(store.original).toBe('{broken');
  });
  it('round trips a duplicate of an 80 character name', () => {
    const copy = preset('copy', copyPresetName('x'.repeat(80)));
    const port = storage();
    new PresetStore(port, validate).commit(() => [copy]);
    expect(new PresetStore(port, validate).presets).toEqual([copy]);
  });
  it('rejects limits before touching storage', () => {
    for (const invalid of [
      preset('long', 'x'.repeat(81)),
      preset('layers'),
      preset('text'),
    ]) {
      if (invalid.id === 'layers')
        invalid.layout.containers = Array.from({ length: 101 }, (_, i) => ({
          ...invalid.layout.containers[0]!,
          id: String(i),
        }));
      if (invalid.id === 'text')
        invalid.layout.containers[0]!.template = 'x'.repeat(100001);
      const port = storage();
      expect(() =>
        new PresetStore(port, validate).commit(() => [invalid]),
      ).toThrow();
      expect(port.getItem()).toBe('[]');
    }
    const boundary = preset('boundary', 'x'.repeat(80));
    boundary.layout.containers = Array.from({ length: 100 }, (_, i) => ({
      ...boundary.layout.containers[0]!,
      id: String(i),
    }));
    expect(
      parsePreset(JSON.stringify(boundary), validate).layout.containers,
    ).toHaveLength(100);
  });
  it('commits delayed imports against rename, delete and save operations', async () => {
    const store = new PresetStore(
      storage(JSON.stringify([preset('delete'), preset('rename')])),
      validate,
    );
    let finish!: () => void;
    const wait = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const imported = ['import-a', 'import-b'].map(async (id) => {
      await wait;
      store.commit((current) => [...current, preset(id)]);
    });
    store.commit((current) =>
      current
        .filter((p) => p.id !== 'delete')
        .map((p) => ({ ...p, name: 'Renamed' })),
    );
    store.commit((current) => [...current, preset('saved')]);
    finish();
    await Promise.all(imported);
    expect(store.presets.map((p) => p.id)).toEqual([
      'rename',
      'saved',
      'import-a',
      'import-b',
    ]);
    expect(store.presets[0]!.name).toBe('Renamed');
  });
  it('does not publish a failed storage write', () => {
    const store = new PresetStore(
      {
        getItem: () => '[]',
        setItem: () => {
          throw Error('quota');
        },
      },
      validate,
    );
    expect(() => store.commit(() => [preset('one')])).toThrow('Could not save');
    expect(store.presets).toEqual([]);
  });
});
