import {
  parsePreset,
  presetStorageKey,
  type LayoutPreset,
} from '../../../../core/src/presets';
import type { SvgAsset } from '../../../../core/src/svg-asset';

type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
/** Synchronous commit boundary: async callers always update the latest collection. */
export class PresetStore {
  presets: LayoutPreset[] = [];
  private rejected: unknown[] = [];
  readonly original: string | null;
  readonly warning: string;
  private blocked = false;

  private storage: StoragePort | null;
  private validateSvg: (name: string, source: string) => SvgAsset;

  constructor(
    storage: StoragePort | null,
    validateSvg: (name: string, source: string) => SvgAsset,
  ) {
    this.storage = storage;
    this.validateSvg = validateSvg;
    let original: string | null = null;
    let warning = '';
    try {
      original = storage?.getItem(presetStorageKey) ?? null;
      const values: unknown = JSON.parse(original ?? '[]');
      if (!Array.isArray(values)) throw Error('Invalid collection');
      const ids = new Set<string>();
      for (const value of values) {
        try {
          const preset = parsePreset(JSON.stringify(value), validateSvg);
          if (!preset.id || ids.has(preset.id)) throw Error('Duplicate ID');
          ids.add(preset.id);
          this.presets.push(preset);
        } catch {
          this.rejected.push(value);
        }
      }
      if (this.rejected.length)
        warning =
          'Some saved presets could not be read. Their original data is preserved. Download a recovery copy.';
    } catch {
      this.blocked = true;
      warning =
        'Saved presets could not be read. Saving is blocked to protect the original data. Download a recovery copy if available.';
    }
    this.original = original;
    this.warning = warning;
  }

  commit(update: (current: LayoutPreset[]) => LayoutPreset[]) {
    if (this.blocked) throw Error(this.warning);
    const next = update(this.presets);
    // Validate exactly what will be persisted, through the same read contract.
    for (const preset of next)
      parsePreset(JSON.stringify(preset), this.validateSvg);
    if (new Set(next.map((preset) => preset.id)).size !== next.length)
      throw Error('Preset identifiers must be unique.');
    try {
      this.storage?.setItem(
        presetStorageKey,
        JSON.stringify([...next, ...this.rejected]),
      );
    } catch {
      throw Error(
        'Could not save presets. Browser storage may be full or unavailable. Export your preset to keep a copy.',
      );
    }
    this.presets = next;
    return next;
  }
}
