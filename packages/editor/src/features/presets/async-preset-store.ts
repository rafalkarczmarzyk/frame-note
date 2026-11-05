import type { LayoutPreset } from '../../../../core/src/presets';
import type { SvgAsset } from '../../../../core/src/svg-asset';
import { PresetStore } from './preset-store';

export interface PresetRepository {
  read(): Promise<string>;
  write(source: string, touchedIds?: readonly string[]): Promise<void>;
}
/** Queue mutations so a slow disk write cannot overwrite a newer edit. */
export class AsyncPresetStore {
  presets: LayoutPreset[] = [];
  warning = '';
  issues: string[] = [];
  original: string | null = null;
  readonly ready: Promise<void>;
  private queue: Promise<unknown>;
  private store!: PresetStore;
  constructor(
    repository: PresetRepository,
    validate: (name: string, svg: string) => SvgAsset,
  ) {
    let originalSource = '[]';
    this.ready = repository.read().then((source) => {
      originalSource = source;
      this.store = new PresetStore(
        { getItem: () => source, setItem: () => {} },
        validate,
      );
      this.presets = this.store.presets;
      this.original = this.store.original;
      this.warning = this.store.warning;
      this.issues = this.store.issues;
    });
    this.queue = this.ready;
    this.commit = (update) => {
      const result = this.queue.then(async () => {
        // Validate using a temporary store; publish only after persistence succeeds.
        let source = '';
        // Re-read the original snapshot to retain rejected entries and the
        // collection-level write block, then apply changes to the latest valid state.
        const candidate = new PresetStore(
          {
            getItem: () => originalSource,
            setItem: (_key, value) => {
              source = value;
            },
          },
          validate,
        );
        candidate.presets = this.presets;
        const before = new Map(
          candidate.presets.map((preset) => [preset.id, preset]),
        );
        const next = candidate.commit(update);
        const touchedIds = next
          .filter((preset) => before.get(preset.id) !== preset)
          .map((preset) => preset.id);
        await repository.write(source, touchedIds);
        this.presets = next;
        return next;
      });
      this.queue = result.catch(() => {});
      return result;
    };
  }
  commit: (
    update: (current: LayoutPreset[]) => LayoutPreset[],
  ) => Promise<LayoutPreset[]>;
}
