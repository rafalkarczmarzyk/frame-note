import { configureDesktopTools, verifyDesktopApp } from './tools-desktop.mjs';
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
if (await configureDesktopTools())
  icon.push('apps/desktop/FrameNoteComposer.icon');
const stage = 'release/staging';
await rm(stage, { recursive: true, force: true });
await mkdir(stage, { recursive: true });
for (const name of [
  'main.cjs',
  'preload.cjs',
  'preset-files.cjs',
  'package.json',
  'renderer',
])
  await cp(`apps/desktop/${name}`, `${stage}/${name}`, { recursive: true });
const result = await packager({
  dir: stage,
  out: 'release',
  name: 'FrameNote',
  executableName: 'FrameNote',
  platform: 'darwin',
  arch: 'arm64',
  appBundleId: 'com.framenote.desktop',
  appVersion: createRequire(import.meta.url)('../package.json').version.split(
    '-',
  )[0],
  buildVersion: createRequire(import.meta.url)('../package.json').version.split(
    '-',
  )[0],
  appCategoryType: 'public.app-category.photography',
  overwrite: true,
  prune: false,
  electronVersion: createRequire(import.meta.url)('electron/package.json')
    .version,
  electronZipDir: process.env.FRAMENOTE_ELECTRON_ZIP_DIR,
  icon,
  osxSign: {
    identity: signed ? identity : '-',
    identityValidation: signed,
    ...(signed ? {} : { timestamp: 'none' }),
    continueOnError: false,
    type: 'distribution',
    preAutoEntitlements: false,
    optionsForFile: () => ({
      // Ad hoc signatures have no Team ID for Hardened Runtime library validation.
      hardenedRuntime: signed,
      entitlements: 'apps/desktop/entitlements.plist',
    }),
  },
  osxNotarize: false,
});
console.log(result.join('\n'));
await rm(stage, { recursive: true, force: true });

verifyDesktopApp(`${result[0]}/FrameNote.app`);
console.log(
  signed
    ? 'Developer signature verified (not notarized).'
    : 'Ad hoc signature verified (not notarized; downloaded apps may require Open Anyway).',
);
await createDesktopDmg(result[0]);
