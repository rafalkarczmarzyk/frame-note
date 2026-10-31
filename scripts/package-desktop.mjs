import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createDesktopDmg } from './create-dmg-desktop.mjs';
import { packager } from '@electron/packager';
import { cp, mkdir, rm } from 'node:fs/promises';
const signed = process.argv.includes('--signed');
const identity = process.env.DEVELOPER_ID?.trim();
if (signed) {
  if (process.platform !== 'darwin')
    throw new Error('Signed desktop packaging requires macOS.');
  if (!identity || identity === '-')
    throw new Error(
      'Set DEVELOPER_ID to the certificate name or SHA-1 shown by security find-identity -v -p codesigning. Ad hoc signing is not supported by --signed.',
    );
  const available = execFileSync(
    'security',
    ['find-identity', '-v', '-p', 'codesigning'],
    { encoding: 'utf8' },
  );
  const matches = [
    ...available.matchAll(/\d+\) ([A-F0-9]{40}) "([^"]+)"/g),
  ].filter(
    ([, hash, name]) => name === identity || hash === identity.toUpperCase(),
  );
  if (new Set(matches.map(([, hash]) => hash)).size !== 1)
    throw new Error(
      'DEVELOPER_ID must match exactly one valid signing identity in the keychain.',
    );
  console.log(
    `Signing with ${matches[0][2]}. This build will not be notarized.`,
  );
}
const icon = ['apps/desktop/FrameNote.icns'];
try {
  execFileSync('actool', ['--version'], { stdio: 'ignore' });
  icon.push('apps/desktop/FrameNoteComposer.icon');
} catch {
  console.warn(
    'Full Xcode is unavailable; packaging with the .icns icon only.',
  );
}
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
  electronZipDir: process.env.FRAMENOTE_ELECTRON_ZIP_DIR,
  icon,
  osxSign: signed
    ? {
        identity,
        continueOnError: false,
        type: 'distribution',
        preAutoEntitlements: false,
        optionsForFile: () => ({
          hardenedRuntime: true,
          entitlements: 'apps/desktop/entitlements.plist',
        }),
      }
    : false,
  osxNotarize: false,
});
console.log(result.join('\n'));
await rm(stage, { recursive: true, force: true });

if (signed)
  execFileSync(
    'codesign',
    [
      '--verify',
      '--deep',
      '--strict',
      '--verbose=2',
      `${result[0]}/FrameNote.app`,
    ],
    { stdio: 'inherit' },
  );
await createDesktopDmg(result[0]);
