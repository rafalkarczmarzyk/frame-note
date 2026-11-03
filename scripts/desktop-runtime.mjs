// SPDX-FileCopyrightText: 2026 Rafał Karczmarzyk
// SPDX-License-Identifier: GPL-3.0-or-later
import { createRequire } from 'node:module';
import { fileURLToPath, URL } from 'node:url';
import { dirname, join } from 'node:path';
import { constants } from 'node:fs';
import {
  cp,
  mkdir,
  readFile,
  access,
  rm,
  mkdtemp,
  rename,
  writeFile,
} from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import process from 'node:process';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);

/** A private development bundle gives macOS the app name without modifying Electron. */
export async function desktopExecutable() {
  const executable = require('electron');
  if (process.platform !== 'darwin') return executable;
  const source = dirname(dirname(dirname(executable)));
  const icon = join(root, 'apps/desktop/FrameNote.icns');
  const info = await readFile(join(source, 'Contents/Info.plist'));
  const key = createHash('sha256')
    .update('FrameNote development runtime v1')
    .update(process.arch)
    .update(info)
    .update(await readFile(executable))
    .update(await readFile(join(root, 'apps/desktop/entitlements.plist')))
    .update(await readFile(icon))
    .digest('hex')
    .slice(0, 16);
  const parent = join(root, 'release/dev', key);
  const bundle = join(parent, 'FrameNote.app');
  const binary = join(bundle, 'Contents/MacOS/Electron');
  try {
    await access(join(parent, 'ready'));
    return binary;
  } catch {
    /* First launch for this runtime. */
  }
  await mkdir(join(root, 'release/dev'), { recursive: true });
  const temporary = await mkdtemp(join(root, 'release/dev/.prepare-'));
  try {
    const copy = join(temporary, 'FrameNote.app');
    await cp(source, copy, {
      recursive: true,
      verbatimSymlinks: true,
      mode: constants.COPYFILE_FICLONE,
    });
    const plist = join(copy, 'Contents/Info.plist');
    for (const [name, value] of [
      ['CFBundleName', 'FrameNote'],
      ['CFBundleDisplayName', 'FrameNote'],
      ['CFBundleIdentifier', 'com.framenote.desktop.dev'],
      ['CFBundleIconFile', 'FrameNote.icns'],
    ])
      execFileSync('/usr/libexec/PlistBuddy', [
        '-c',
        `Set :${name} ${value}`,
        plist,
      ]);
    await cp(icon, join(copy, 'Contents/Resources/FrameNote.icns'));
    // Electron's downloaded development binaries have incomplete resource
    // signatures. Use the same nested-code signer as the existing packager.
    const { sign } = createRequire(require.resolve('@electron/packager'))(
      '@electron/osx-sign',
    );
    await sign({
      app: copy,
      identity: '-',
      identityValidation: false,
      preAutoEntitlements: false,
      optionsForFile: () => ({
        hardenedRuntime: false,
        entitlements: join(root, 'apps/desktop/entitlements.plist'),
        timestamp: 'none',
      }),
    });
    execFileSync(
      '/usr/bin/codesign',
      ['--verify', '--deep', '--strict', copy],
      { stdio: 'pipe' },
    );
    await writeFile(join(temporary, 'ready'), key);
    try {
      await rename(temporary, parent);
    } catch (error) {
      // A simultaneous dev/test launch may have prepared the same bundle.
      if (!['EEXIST', 'ENOTEMPTY'].includes(error.code)) throw error;
      await access(join(parent, 'ready'));
    }
    return binary;
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}
