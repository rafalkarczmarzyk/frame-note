import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
const state = vi.hoisted(() => ({
  files: new Map<string, Buffer>(),
  calls: [] as string[][],
  failUpload: false,
  badDigest: false,
  alreadyPublished: false,
}));
vi.mock('node:fs', async (original) => {
  const fs = await original<typeof import('node:fs')>();
  return {
    ...fs,
    readFileSync: vi.fn((path: string, encoding?: string) => {
      const value = state.files.get(path);
      return value
        ? encoding
          ? value.toString()
          : value
        : fs.readFileSync(path);
    }),
    readdirSync: vi.fn(() =>
      [...state.files.keys()]
        .filter((p) => p.startsWith('release-assets/'))
        .map((p) => p.slice('release-assets/'.length)),
    ),
    writeFileSync: vi.fn((path: string, value: string) =>
      state.files.set(path, Buffer.from(value)),
    ),
  };
});
vi.mock('node:child_process', () => ({
  execFileSync: vi.fn((_command: string, args: string[]) => {
    state.calls.push(args);
    if (args[0] === 'api')
      return JSON.stringify([
        state.alreadyPublished
          ? [{ tag_name: 'v0.3.2-beta', draft: false }]
          : [],
      ]);
    if (args[1] === 'upload' && state.failUpload) throw Error('Upload failed');
    if (args[1] === 'view')
      return JSON.stringify({
        url: 'https://example.test/release',
        isDraft: true,
        assets: [...state.files.entries()]
          .filter(([p]) => p.startsWith('release-assets/'))
          .map(([path, bytes]) => ({
            name: path.split('/').pop(),
            state: 'uploaded',
            size: bytes.length,
            digest: state.badDigest
              ? 'sha256:wrong'
              : 'sha256:' + createHash('sha256').update(bytes).digest('hex'),
          })),
      });
    return '';
  }),
}));
beforeEach(() => {
  vi.resetModules();
  state.calls = [];
  state.failUpload = state.badDigest = state.alreadyPublished = false;
  state.files = new Map([
    ['package.json', Buffer.from('{"version":"0.3.2-beta"}')],
    [
      'CHANGELOG.md',
      Buffer.from('## [0.3.2-beta] - 2026-11-02\n\nFixed builds.\n'),
    ],
    ...['mac-arm64.dmg', 'win-x64-portable.exe', 'linux-x86_64.AppImage'].map(
      (suffix) =>
        [
          `release-assets/FrameNote-0.3.2-beta-${suffix}`,
          Buffer.from(suffix),
        ] as [string, Buffer],
    ),
  ]);
  vi.stubEnv('RELEASE_TAG', 'v0.3.2-beta');
  vi.stubEnv('GITHUB_REPOSITORY', 'example/project');
  vi.stubEnv('GITHUB_STEP_SUMMARY', 'test-summary.md');
  vi.spyOn(process, 'argv', 'get').mockReturnValue([
    'node',
    'publish',
    '--publish',
  ]);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
async function run() {
  // @ts-expect-error Release orchestration is plain JavaScript.
  await import('../scripts/publish-desktop-draft.mjs');
}
it('publishes only after successful upload and matching remote asset digests', async () => {
  await run();
  expect(state.calls.findIndex((a) => a[1] === 'edit')).toBeGreaterThan(
    state.calls.findIndex((a) => a[1] === 'view'),
  );
  expect(state.calls.at(-1)).toEqual([
    'release',
    'edit',
    'v0.3.2-beta',
    '--draft=false',
    '--prerelease=false',
    '--latest',
  ]);
  expect(state.files.get('test-summary.md')?.toString()).toContain(
    'Open published release',
  );
});
it('keeps a draft private when upload fails', async () => {
  state.failUpload = true;
  await expect(run()).rejects.toThrow('Upload failed');
  expect(state.calls.some((a) => a[1] === 'edit')).toBe(false);
});
it('keeps a draft private when an uploaded digest is wrong', async () => {
  state.badDigest = true;
  await expect(run()).rejects.toThrow('Uploaded asset verification failed');
  expect(state.calls.some((a) => a[1] === 'edit')).toBe(false);
});
it('rejects incomplete local build artifacts before creating a release', async () => {
  state.files.delete(
    'release-assets/FrameNote-0.3.2-beta-win-x64-portable.exe',
  );
  await expect(run()).rejects.toThrow(
    'Incomplete or unexpected release assets',
  );
  expect(state.calls).toEqual([]);
});
it('does not alter an already published release', async () => {
  state.alreadyPublished = true;
  await expect(run()).rejects.toThrow('Refusing to modify a published release');
  expect(state.calls.some((a) => a[1] === 'upload' || a[1] === 'edit')).toBe(
    false,
  );
});
it('preserves draft-only behavior without the publish flag', async () => {
  vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'publish']);
  await run();
  expect(state.calls.some((a) => a[1] === 'edit')).toBe(false);
  expect(state.files.get('test-summary.md')?.toString()).toContain(
    'Review release draft',
  );
});
