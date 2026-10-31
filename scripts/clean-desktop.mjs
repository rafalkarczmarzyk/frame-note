import { rm } from 'node:fs/promises';

// Resolve against the repository, independent of the caller's working directory.
await rm(new URL('../release/', import.meta.url), {
  recursive: true,
  force: true,
});
