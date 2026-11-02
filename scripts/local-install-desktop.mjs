import { access, cp, lstat, mkdtemp, rename, rm } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { verifyDesktopApp } from './tools-desktop.mjs';

export async function inspectInstallTarget(destination) {
  const stat = await lstat(destination).catch((error) => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  if (!stat) return false;
  if (stat.isSymbolicLink() || !stat.isDirectory())
    throw new Error(
      `Refusing to replace a symlink or non-directory: ${destination}`,
    );
  const identity = execFileSync(
    '/usr/libexec/PlistBuddy',
    [
      '-c',
      'Print :CFBundleIdentifier',
      join(destination, 'Contents/Info.plist'),
    ],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  ).trim();
  if (identity !== 'com.framenote.desktop')
    throw new Error(`Refusing to replace another application: ${destination}`);
  return true;
}

export function assertFrameNoteClosed() {
  const processes = execFileSync('/bin/ps', ['-axo', 'comm='], {
    encoding: 'utf8',
  });
  if (
    processes
      .split('\n')
      .some((line) =>
        /(?:^|\/)FrameNote(?:\.app\/Contents\/MacOS\/FrameNote)?$/.test(
          line.trim(),
        ),
      )
  )
    throw new Error('Quit FrameNote manually before installing, then retry.');
}

export async function checkInstallDirectory(directory) {
  try {
    await access(directory, constants.W_OK | constants.X_OK);
  } catch (error) {
    throw new Error(
      `Cannot write to ${directory}. Use pnpm desktop:install --user for ~/Applications. No sudo was attempted.`,
      { cause: error },
    );
  }
}

// Stage and verify on the destination volume before touching the previous app.
export async function installLocalApp(
  source,
  directory,
  {
    inspect = inspectInstallTarget,
    verify = verifyDesktopApp,
    assertClosed = assertFrameNoteClosed,
    move = rename,
  } = {},
) {
  const destination = join(directory, 'FrameNote.app');
  await checkInstallDirectory(directory);
  await inspect(source);
  await verify(source);
  await inspect(destination);
  assertClosed();
  const temporary = await mkdtemp(join(directory, '.framenote-install-'));
  const staged = join(temporary, 'FrameNote.app');
  const previous = join(temporary, 'previous.app');
  let backedUp = false;
  let preserveBackup = false;
  try {
    await cp(source, staged, { recursive: true, verbatimSymlinks: true });
    await inspect(staged);
    await verify(staged);
    const existing = await inspect(destination);
    assertClosed();
    if (existing) {
      await move(destination, previous);
      backedUp = true;
    }
    try {
      await move(staged, destination);
    } catch (error) {
      if (backedUp) {
        try {
          await move(previous, destination);
        } catch (restoreError) {
          preserveBackup = true;
          throw new AggregateError(
            [error, restoreError],
            `Installation and restore failed. Previous app preserved at ${previous}.`,
            { cause: restoreError },
          );
        }
      }
      throw error;
    }
  } finally {
    if (!preserveBackup) await rm(temporary, { recursive: true, force: true });
  }
  return destination;
}
