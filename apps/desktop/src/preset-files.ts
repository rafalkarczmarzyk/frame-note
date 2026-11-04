import {
  mkdir,
  readdir,
  readFile,
  writeFile,
  rename,
  unlink,
  lstat,
  link,
} from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { readPreset } from '../../../scripts/preset-node';
import { presetFilename } from '../../../packages/core/src/preset-filename';
import { presetByteLimit } from '../../../packages/core/src/presets';

const validId = (id: string) => {
  if (!/^[a-zA-Z0-9-]{1,100}$/u.test(id))
    throw Error('Invalid preset identifier.');
  return id;
};
/** One file per preset; load at startup, no directory watcher or legacy import. */
export class PresetFiles {
  private saved = new Map<string, string>();
  private names = new Map<string, string>();
  private loaded = false;
  private queue: Promise<unknown> = Promise.resolve();
  constructor(privateDirectory: string) {
    this.directory = join(privateDirectory, 'presets');
  }
  readonly directory: string;
  async read() {
    await mkdir(this.directory, { recursive: true });
    const next = new Map<string, string>();
    const names = new Map<string, string>();
    for (const name of (await readdir(this.directory)).sort()) {
      if (!name.toLowerCase().endsWith('.json')) continue;
      const file = join(this.directory, name);
      const info = await lstat(file);
      if (!info.isFile()) throw Error('Preset must be a regular file: ' + name);
      if (info.size > presetByteLimit)
        throw Error('Preset exceeds 5 MB: ' + name);
      const preset = readPreset(await readFile(file, 'utf8'));
      validId(preset.id);
      if (next.has(preset.id))
        throw Error('Duplicate preset identifier: ' + name);
      names.set(preset.id, name);
      next.set(preset.id, JSON.stringify(preset));
    }
    this.saved = next;
    this.names = names;
    this.loaded = true;
    return '[' + [...next.values()].join(',') + ']';
  }
  write(source: string, touchedIds?: readonly string[]) {
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
      const names = new Map(this.names);
      const occupied = new Set(await readdir(this.directory));
      const touched = new Set(touchedIds ?? []);
      if ([...touched].some((id) => !next.has(id)))
        throw Error('Unknown saved preset.');
      type Operation = {
        old?: string;
        file?: string;
        temp?: string;
        backup?: string;
        published?: boolean;
        removed?: boolean;
      };
      const operations: Operation[] = [];
      let retainBackups = false;
      const checkOld = async (id: string, file: string) => {
        const info = await lstat(file);
        if (
          !info.isFile() ||
          info.size > presetByteLimit ||
          JSON.stringify(readPreset(await readFile(file, 'utf8'))) !==
            this.saved.get(id)
        )
          throw Error('Preset changed on disk. Restart before saving.');
      };
      try {
        for (const [id, json] of next) {
          if (this.saved.get(id) === json && !touched.has(id)) continue;
          const oldName = this.names.get(id);
          const old = oldName ? join(this.directory, oldName) : undefined;
          if (old) await checkOld(id, old);
          // The preset can reuse its own name, including a prior collision suffix.
          const name = JSON.parse(json).name as string;
          const previousName = this.saved.has(id)
            ? JSON.parse(this.saved.get(id)!).name
            : undefined;
          let filename: string;
          if (oldName && name === previousName && oldName !== id + '.json')
            filename = oldName;
          else {
            const others = new Set(occupied);
            if (oldName) others.delete(oldName);
            filename = presetFilename(name, others);
          }
          occupied.add(filename);
          names.set(id, filename);
          const file = join(this.directory, filename);
          const temp = join(this.directory, '.' + randomUUID() + '.tmp');
          const op: Operation = { old, file, temp };
          operations.push(op);
          await writeFile(temp, json + '\n', { flag: 'wx' });
          if (old) {
            op.backup = join(this.directory, '.' + randomUUID() + '.tmp');
            await link(old, op.backup);
          }
        }
        for (const id of this.saved.keys()) {
          if (next.has(id)) continue;
          const old = join(this.directory, this.names.get(id)!);
          await checkOld(id, old);
          const backup = join(this.directory, '.' + randomUUID() + '.tmp');
          operations.push({ old, backup });
          await link(old, backup);
          names.delete(id);
        }
        for (const op of operations) {
          if (op.file && op.temp) {
            if (op.file === op.old) await rename(op.temp, op.file);
            else await link(op.temp, op.file); // Exclusive publish: never overwrite a collision.
            op.published = true;
          }
          if (op.old && op.old !== op.file) {
            await unlink(op.old);
            op.removed = true;
          }
        }
      } catch (error) {
        // Restore all published operations before reporting failure to the UI.
        const recoveryErrors: unknown[] = [];
        for (const op of [...operations].reverse()) {
          try {
            if (op.published && op.file === op.old && op.backup)
              await rename(op.backup, op.old!);
            else {
              if (op.removed && op.backup) await link(op.backup, op.old!);
              if (op.published && op.file) await unlink(op.file);
            }
          } catch (recoveryError) {
            recoveryErrors.push(recoveryError);
          }
        }
        if (recoveryErrors.length) {
          retainBackups = true;
          throw new AggregateError(
            [error, ...recoveryErrors],
            'Preset save failed; recovery copies remain in ' +
              this.directory +
              '. Restart before editing.',
            { cause: error },
          );
        }
        throw error;
      } finally {
        for (const op of operations) {
          if (op.temp) await unlink(op.temp).catch(() => {});
          if (op.backup && !retainBackups)
            await unlink(op.backup).catch(() => {});
        }
      }
      this.names = names;
      this.saved = next;
    });
    this.queue = result.catch(() => {});
    return result;
  }
}

export { ConfigFile } from './config-file.mts';
