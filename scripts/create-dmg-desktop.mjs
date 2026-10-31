import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, rename, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// Finder stores the layout and background reference in .DS_Store on the image.
// A private mount point avoids touching an already mounted FrameNote volume.
export async function createDesktopDmg(appDirectory) {
  const work = await mkdtemp(join(tmpdir(), 'framenote-dmg-'));
  const source = join(work, 'source');
  const mount = join(work, 'mount');
  const writable = join(work, 'layout.dmg');
  const output = resolve('release/FrameNote-macOS-arm64.dmg');
  const pending = join(work, 'FrameNote.dmg');
  let mounted = false;
  const run = (command, args) =>
    execFileSync(command, args, { stdio: 'inherit' });
  try {
    await mkdir(join(source, '.background'), { recursive: true });
    await mkdir(mount);
    await cp(
      join(appDirectory, 'FrameNote.app'),
      join(source, 'FrameNote.app'),
      {
        recursive: true,
      },
    );
    await symlink('/Applications', join(source, 'Applications'));
    await cp(
      'apps/desktop/installer/background.png',
      join(source, '.background', 'background.png'),
    );
    run('hdiutil', [
      'create',
      '-fs',
      'HFS+',
      '-volname',
      'FrameNote',
      '-srcfolder',
      source,
      '-format',
      'UDRW',
      writable,
    ]);
    run('hdiutil', [
      'attach',
      '-nobrowse',
      '-noautoopen',
      '-mountpoint',
      mount,
      writable,
    ]);
    mounted = true;
    // Pass the path as an argument, never interpolate it into AppleScript.
    run('osascript', [
      '-e',
      `
on run argv
  set volumeFolder to POSIX file (item 1 of argv) as alias
  tell application "Finder"
    set installerFolder to folder volumeFolder
    open installerFolder
    set installerWindow to container window of installerFolder
    set current view of installerWindow to icon view
    set toolbar visible of installerWindow to false
    set statusbar visible of installerWindow to false
    set bounds of installerWindow to {160, 120, 800, 520}
    set options to icon view options of installerWindow
    set arrangement of options to not arranged
    set icon size of options to 96
    set text size of options to 14
    set background picture of options to file ".background:background.png" of installerFolder
    set position of item "FrameNote.app" of installerFolder to {170, 210}
    set position of item "Applications" of installerFolder to {470, 210}
    update installerFolder without registering applications
    delay 2
    close installerWindow
  end tell
end run`,
      mount,
    ]);
    run('sync', []);
    run('hdiutil', ['detach', mount]);
    mounted = false;
    run('hdiutil', ['convert', writable, '-format', 'UDZO', '-o', pending]);
    run('hdiutil', ['verify', pending]);
    await rename(pending, output);
    console.log(`Created ${output}`);
  } finally {
    if (mounted) run('hdiutil', ['detach', mount]);
    await rm(work, { recursive: true, force: true });
  }
}
