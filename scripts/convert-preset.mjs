import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath, URL } from 'node:url';

const directory = await mkdtemp(join(tmpdir(), 'framenote-preset-'));
try {
  const outfile = join(directory, 'convert.mjs');
  await build({
    entryPoints: [
      fileURLToPath(new URL('./convert-preset.ts', import.meta.url)),
    ],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile,
  });
  await import(pathToFileURL(outfile).href);
} finally {
  await rm(directory, { recursive: true, force: true });
}
