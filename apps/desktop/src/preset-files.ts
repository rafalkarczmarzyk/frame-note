import {
  mkdir,
  readdir,
  readFile,
  writeFile,
  rename,
  unlink,
  stat,
} from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { readPreset } from '../../../scripts/preset-node';
import { presetByteLimit } from '../../../packages/core/src/presets';

const validId = (id: string) => {
  if (!/^[a-zA-Z0-9-]{1,100}$/u.test(id))
    throw Error('Invalid preset identifier.');
  return id;
};
/** One file per preset; load at startup, no directory watcher or legacy import. */
export class PresetFiles {
  private saved = new Map<string, string>();
  private loaded = false;
  private queue: Promise<unknown> = Promise.resolve();
  constructor(privateDirectory: string) {
    this.directory = join(privateDirectory, 'presets');
  }
  readonly directory: string;
  async read() {
    await mkdir(this.directory, { recursive: true });
    const next = new Map<string, string>();
    for (const name of (await readdir(this.directory)).sort()) {
      if (!name.endsWith('.json')) continue;
      const file = join(this.directory, name);
      if ((await stat(file)).size > presetByteLimit)
        throw Error('Preset exceeds 5 MB: ' + name);
      const preset = readPreset(await readFile(file, 'utf8'));
      validId(preset.id);
      if (name !== preset.id + '.json' || next.has(preset.id))
        throw Error('Preset filename must match its identifier: ' + name);
      next.set(preset.id, JSON.stringify(preset));
    }
    this.saved = next;
    this.loaded = true;
    return '[' + [...next.values()].join(',') + ']';
  }
  write(source: string) {
    const result = this.queue.then(async () => {
      if (!this.loaded) throw Error('Load the preset library before saving.');
      const values: unknown = JSON.parse(source);
      if (!Array.isArray(values)) throw Error('Invalid preset library.');
      const next = new Map<string, string>();
      for (const value of values) {
        const preset = readPreset(JSON.stringify(value));
        validId(preset.id);
        if (next.has(preset.id)) throw Error('Duplicate preset identifier.');
        next.set(preset.id, JSON.stringify(preset));
      }
      // UI operations change one preset at a time. Validate the whole request first.
      for (const [id, json] of next) {
        if (this.saved.get(id) === json) continue;
        const file = join(this.directory, id + '.json');
        const temp = file + '.' + randomUUID() + '.tmp';
        try {
          await writeFile(temp, json + '\n', { flag: 'wx' });
          await rename(temp, file);
        } finally {
          await unlink(temp).catch(() => {});
        }
      }
      for (const id of this.saved.keys()) {
        if (!next.has(id)) await unlink(join(this.directory, id + '.json'));
      }
      this.saved = next;
    });
    this.queue = result.catch(() => {});
    return result;
  }
}
