import type { LayoutPreset } from '../../../../core/src/presets';
import type { SvgAsset } from '../../../../core/src/svg-asset';
import { PresetStore } from './preset-store';

export interface PresetRepository {
  read(): Promise<string>;
  write(source: string): Promise<void>;
}
/** Queue mutations so a slow disk write cannot overwrite a newer edit. */
export class AsyncPresetStore {
  presets: LayoutPreset[] = [];
  warning = '';
  original: string | null = null;
  readonly ready: Promise<void>;
  private queue: Promise<unknown>;
  private store!: PresetStore;
  constructor(
    repository: PresetRepository,
    validate: (name: string, svg: string) => SvgAsset,
  ) {
    this.ready = repository.read().then((source) => {
      this.store = new PresetStore(
        { getItem: () => source, setItem: () => {} },
        validate,
      );
      this.presets = this.store.presets;
      this.original = this.store.original;
      this.warning = this.store.warning;
    });
    this.queue = this.ready;
    this.commit = (update) => {
      const result = this.queue.then(async () => {
        // Validate using a temporary store; publish only after persistence succeeds.
        let source = '';
        const candidate = new PresetStore(
          {
            getItem: () => JSON.stringify(this.presets),
            setItem: (_key, value) => {
              source = value;
            },
          },
          validate,
        );
        if (this.warning) throw Error(this.warning);
        const next = candidate.commit(update);
        await repository.write(source);
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
