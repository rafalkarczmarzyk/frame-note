import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { readPreset } from '../../../../scripts/preset-node';
import { presetV1 } from './v1';
import { migratePresetV1, presetV2 } from './v2';
import { defaultTiledPosition } from '../tiled-watermark';
import { createPreset } from '../presets';

describe('preset v2', () => {
  it('reads the v2 fixture with fractional angles and signed offsets', () => {
    const parsed = readPreset(
      readFileSync('tests/fixtures/presets/v2.json', 'utf8'),
    );
    expect(parsed.layout.containers[0]!.position.tiled).toMatchObject({
      angle: 30.1,
      pattern: 'staggered',
      offset: { x: -15, y: 12 },
    });
    expect(readPreset(JSON.stringify(parsed))).toEqual(parsed);
  });
  it('migrates the frozen v1 fixture without changing its layout', () => {
    const original = presetV1.parse(
      JSON.parse(readFileSync('tests/fixtures/presets/v1.json', 'utf8')),
    );
    const migrated = migratePresetV1(original);
    expect(migrated.layout).toEqual(original.layout);
    expect(migrated.version).toBe(2);
    expect(original.version).toBe(1);
    expect(presetV2.parse(migrated)).toEqual(migrated);
  });
  it('round trips active and retained tiled settings without losing manual position', () => {
    const value = readPreset(
      readFileSync('tests/fixtures/presets/v1.json', 'utf8'),
    );
    const position = value.layout.containers[0]!.position;
    position.custom = { x: 23, y: 76 };
    position.tiled = {
      ...defaultTiledPosition(),
      angle: 30.1,
      pattern: 'staggered',
      offset: { x: -15, y: 12 },
    };
    for (const enabled of [true, false]) {
      position.tiled.enabled = enabled;
      const written = createPreset(
        value.id,
        value.name,
        value.layout,
        value.icons,
      );
      expect(readPreset(JSON.stringify(written))).toEqual(written);
    }
    expect(presetV1.safeParse({ ...value, version: 1 }).success).toBe(false);
  });
  it('rejects invalid pattern values instead of silently dropping them', () => {
    const value = readPreset(
      readFileSync('tests/fixtures/presets/v1.json', 'utf8'),
    );
    value.layout.containers[0]!.position.tiled = {
      ...defaultTiledPosition(),
      angle: Infinity,
    };
    expect(() => readPreset(JSON.stringify(value))).toThrow('Invalid');
  });
});

it('preserves v1 browser storage bytes before migrating the library', async () => {
  const { writePresetStorage, presetV1BackupKey } =
    await import('../../../editor/src/features/presets/preset-store');
  const { presetStorageKey } = await import('../presets');
  const source = JSON.stringify([
    JSON.parse(readFileSync('tests/fixtures/presets/v1.json', 'utf8')),
  ]);
  const values = new Map<string, string>([[presetStorageKey, source]]);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
  const next = JSON.stringify([
    readPreset(readFileSync('tests/fixtures/presets/v2.json', 'utf8')),
  ]);
  writePresetStorage(storage, next);
  expect(values.get(presetV1BackupKey)).toBe(source);
  expect(values.get(presetStorageKey)).toBe(next);
  writePresetStorage(storage, '[]');
  expect(values.get(presetV1BackupKey)).toBe(source);
});
