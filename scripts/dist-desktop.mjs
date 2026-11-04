// SPDX-FileCopyrightText: 2026 Rafał Karczmarzyk
// SPDX-License-Identifier: GPL-3.0-or-later
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { build, Platform, Arch } from 'electron-builder';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { stageDesktopLegal } from './stage-desktop-legal.mjs';
import { verifyPackagedLegal } from './verify-packaged-legal.mjs';

// Isolated staging avoids packaging workspace dependencies or stale local builds.
const stage = await mkdtemp(join(tmpdir(), 'framenote-dist-'));
const root = process.cwd();
const manifest = JSON.parse(await readFile('package.json', 'utf8'));
const electron = JSON.parse(
  await readFile('node_modules/electron/package.json', 'utf8'),
);
const platforms = {
  darwin: Platform.MAC,
  win32: Platform.WINDOWS,
  linux: Platform.LINUX,
};
const target = platforms[process.platform];
if (!target) throw Error('Unsupported packaging platform');
const arch = process.platform === 'darwin' ? Arch.arm64 : Arch.x64;
await rm('release/ci', { recursive: true, force: true });
await rm(stage, { recursive: true, force: true });
await mkdir(stage, { recursive: true });
for (const file of [
  'main.cjs',
  'window-geometry.cjs',
  'preload.cjs',
  'preset-files.cjs',
  'renderer',
]) {
  await cp(`apps/desktop/${file}`, `${stage}/${file}`, { recursive: true });
}
await cp('release/desktop-build/update-check.cjs', `${stage}/update-check.cjs`);
await writeFile(
  `${stage}/package.json`,
  JSON.stringify(
    {
      name: 'framenote',
      version: manifest.version,
      main: 'main.cjs',
      description: 'Local photo captions and metadata editor',
      author: 'FrameNote contributors',
      license: 'GPL-3.0-or-later',
      packageManager: 'npm@10.9.2',
    },
    null,
    2,
  ),
);
await stageDesktopLegal(stage);
await build({
  projectDir: stage,
  targets: target.createTarget(undefined, arch),
  publish: 'never',
  config: {
    appId: 'com.framenote.desktop',
    productName: 'FrameNote',
    electronVersion: electron.version,
    directories: {
      app: stage,
      output: resolve(root, 'release/ci'),
      buildResources: resolve(root, 'apps/desktop'),
    },
    files: [
      'main.cjs',
      'window-geometry.cjs',
      'preload.cjs',
      'preset-files.cjs',
      'update-check.cjs',
      'renderer/**/*',
      'package.json',
      'LICENSE',
      'LICENSING.md',
      'PHOTOGRAPHS.txt',
    ],
    asar: true,
    afterPack(context) {
      const resources =
        process.platform === 'darwin'
          ? `${context.appOutDir}/FrameNote.app/Contents/Resources`
          : `${context.appOutDir}/resources`;
      verifyPackagedLegal(resources);
    },
    npmRebuild: false,
    artifactName: 'FrameNote-${version}-${os}-${arch}.${ext}',
    mac: {
      target: ['dmg'],
      icon: resolve(root, 'apps/desktop/FrameNote.icns'),
      category: 'public.app-category.photography',
      identity: '-',
      hardenedRuntime: false,
      notarize: false,
      entitlements: resolve(root, 'apps/desktop/entitlements.plist'),
      entitlementsInherit: resolve(root, 'apps/desktop/entitlements.plist'),
    },
    dmg: {
      sign: false,
      background: resolve(root, 'apps/desktop/installer/background.png'),
      window: { width: 640, height: 400 },
      contents: [
        { x: 180, y: 190, type: 'file' },
        { x: 460, y: 190, type: 'link', path: '/Applications' },
      ],
    },
    win: {
      target: ['portable'],
      signAndEditExecutable: false,
      artifactName: 'FrameNote-${version}-win-${arch}-portable.${ext}',
    },
    portable: { requestExecutionLevel: 'user' },
    linux: {
      target: ['AppImage'],
      category: 'Graphics',
      executableName: 'framenote',
    },
  },
});
if (process.platform === 'darwin') {
  execFileSync(
    'codesign',
    ['--verify', '--deep', '--strict', 'release/ci/mac-arm64/FrameNote.app'],
    { stdio: 'inherit' },
  );
}
await rm(stage, { recursive: true, force: true });
