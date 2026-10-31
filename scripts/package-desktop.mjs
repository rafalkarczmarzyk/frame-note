import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { packager } from '@electron/packager';
import { cp, mkdir, rm } from 'node:fs/promises';
const stage = 'release/staging';
await rm(stage, { recursive: true, force: true });
await mkdir(stage, { recursive: true });
for (const name of ['main.cjs', 'preload.cjs', 'package.json', 'renderer'])
  await cp(`apps/desktop/${name}`, `${stage}/${name}`, { recursive: true });
const result = await packager({
  dir: stage,
  out: 'release',
  name: 'FrameNote',
  executableName: 'FrameNote',
  platform: 'darwin',
  arch: 'arm64',
  appBundleId: 'com.framenote.desktop',
  appCategoryType: 'public.app-category.photography',
  overwrite: true,
  prune: false,
  electronVersion: createRequire(import.meta.url)('electron/package.json')
    .version,
  icon: 'apps/desktop/FrameNote.icns',
  osxSign: false,
  osxNotarize: false,
});
console.log(result.join('\n'));
await rm(stage, { recursive: true, force: true });

const dmg = resolve('release/FrameNote-macOS-arm64.dmg');
await rm(dmg, { force: true });
execFileSync(
  'hdiutil',
  [
    'create',
    '-volname',
    'FrameNote',
    '-srcfolder',
    result[0],
    '-format',
    'UDZO',
    dmg,
  ],
  { stdio: 'inherit' },
);
execFileSync('hdiutil', ['verify', dmg], { stdio: 'inherit' });
