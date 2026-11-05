import { mkdir, readFile, open, rename, rm, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  defaultDesktopConfig,
  parseDesktopConfig,
  type DesktopConfig,
} from '../../../packages/core/src/desktop-config.ts';

/** One startup read; serialized atomic writes operate on the in-memory state. */
export class ConfigFile {
  readonly file: string;
  private value = defaultDesktopConfig();
  private queue = Promise.resolve();
  private blocked = false;
  private missing = false;
  private issue: 'invalid' | 'unsupported' | null = null;
  warning = '';
  private directory: string;
  constructor(directory: string) {
    this.directory = directory;
    this.file = join(directory, 'config.json');
  }
  async load() {
    try {
      const source = await readFile(this.file, 'utf8');
      try {
        const value = JSON.parse(source);
        if (typeof value?.version === 'number' && value.version > 1)
          this.issue = 'unsupported';
      } catch {
        /* Malformed JSON is recoverable only after explicit confirmation. */
      }
      if (source.length > 65536) throw Error('Configuration is too large.');
      this.value = parseDesktopConfig(JSON.parse(source));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT')
        this.missing = true;
      else {
        this.blocked = true;
        this.issue ??= 'invalid';
        this.warning =
          'Configuration could not be read or is unsupported. FrameNote is using defaults. The original file has been preserved. Save in Settings offers to back up and replace an invalid file; newer formats cannot be replaced.';
      }
    }
    return this.snapshot();
  }
  canReplace() {
    return this.blocked && this.issue === 'invalid';
  }
  snapshot() {
    return { config: structuredClone(this.value), warning: this.warning };
  }
  initialize(quality: unknown) {
    return this.enqueue(async () => {
      if (!this.missing || this.blocked) return this.snapshot();
      const next = {
        ...this.value,
        exportQuality:
          Number.isInteger(quality) &&
          Number(quality) >= 1 &&
          Number(quality) <= 100
            ? Number(quality)
            : 95,
      };
      try {
        await this.publish(next);
        this.missing = false;
        this.warning = '';
      } catch {
        // Keep the imported preference in memory so a later successful Save
        // does not replace an existing profile preference with a default.
        this.value = next;
        this.warning =
          'Configuration could not be created. Preferences are available for this session; check file permissions and retry in Settings.';
      }
      return this.snapshot();
    });
  }
  update(patch: Partial<Omit<DesktopConfig, 'version'>>, replace = false) {
    return this.enqueue(async () => {
      if (this.blocked && !replace) throw Error(this.warning);
      if (replace && this.blocked) {
        // Unsupported formats are never replaced, even through recovery.
        const source = await readFile(this.file, 'utf8');
        let original: { version?: unknown } | null = null;
        try {
          original = JSON.parse(source);
        } catch {
          /* Preserve malformed source in backup. */
        }
        if (typeof original?.version === 'number' && original.version > 1)
          throw Error('A newer configuration format cannot be replaced.');
        await copyFile(this.file, this.file + '.' + randomUUID() + '.backup');
      }
      const next = parseDesktopConfig({
        ...this.value,
        ...patch,
        ...(patch.window
          ? { window: { ...this.value.window, ...patch.window } }
          : {}),
      });
      await this.publish(next);
      this.blocked = false;
      this.issue = null;
      this.missing = false;
      this.warning = '';
      return this.snapshot();
    });
  }
  private enqueue<T>(run: () => Promise<T>): Promise<T> {
    const result = this.queue.then(run);
    this.queue = result.then(
      () => {},
      () => {},
    );
    return result;
  }
  private async publish(next: DesktopConfig) {
    await mkdir(this.directory, { recursive: true });
    const temporary = this.file + '.' + randomUUID() + '.tmp';
    try {
      const handle = await open(temporary, 'wx', 0o600);
      try {
        await handle.writeFile(JSON.stringify(next, null, 2) + '\n');
        await handle.sync();
      } finally {
        await handle.close();
      }
      await rename(temporary, this.file);
      this.value = next;
    } finally {
      await rm(temporary, { force: true }).catch(() => {});
    }
  }
}
