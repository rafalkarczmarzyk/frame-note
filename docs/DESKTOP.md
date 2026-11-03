# FrameNote desktop

[User guide](USER_GUIDE.md) · [Development and packaging](DEVELOPMENT.md)

The Electron app shares the web editor and processes photos locally. Editing,
bundled fonts and export work offline. Update checks require internet access.

## Downloads and installation

Release targets are macOS Apple Silicon DMG, Windows x64 portable EXE and Linux
x64 AppImage. Downloads are available through
[GitHub Releases](https://github.com/rafalkarczmarzyk/frame-note/releases).

- **macOS:** open the DMG, drag FrameNote into Applications, eject and launch.
  Quit the old app before replacement. Builds are ad hoc signed, not notarized;
  downloaded apps may need the per-app Open Anyway approval in Privacy & Security.
  Do not disable system protections. Intel Macs and older macOS versions are unverified.
- **Windows:** run the portable EXE without an installation wizard. Electron is
  extracted temporarily; settings are not stored next to the EXE. The unsigned
  file remains subject to SmartScreen/Smart App Control; portable does not bypass them.
- **Linux:** use the AppImage in a compatible desktop/AppImage environment.

CI has exercised packaged startup/import/export on all three systems and the
Windows portable launcher. This is not full manual platform acceptance: Windows/
Linux dialogs, system fonts, ZIP and preset persistence, and installation on a
second Mac still need broader verification.

## Updates

Desktop checks GitHub releases at startup. A newer version produces a persistent,
dismissible notice at the top of the workspace. **View release** opens that
release in the system browser; download and replace the app manually.
**FrameNote → Check for Updates…** also starts a check. There is no automatic
installer or update button in About. Network errors do not interrupt editing.
Web has no release checker or update notice.

## Local macOS installation

On Apple Silicon, after `pnpm i`, run:

```sh
pnpm desktop:install
```

This builds, verifies and installs an ad hoc signed app into `/Applications`,
without a DMG. Quit FrameNote first. Use `--user` for `~/Applications` and `--open`
to launch after success. The folder must be writable; the command does not use
sudo, close a running app or silently change its destination.

Replacement is staged and verified before swapping the old app. Failure attempts
to restore the previous copy and reports a preserved backup if recovery fails.
Symlinks and unrelated apps are rejected. Presets and the application profile
are not modified. Isolated installation/update tests passed; those tests did not
verify installing into the real Applications folders or launching via `--open`.
Build tools and signing requirements: [Development](DEVELOPMENT.md#xcode-detection).

## Data and presets

Presets are individual v1 JSON files in `~/FrameNote/presets`, where `~` is the
user's home directory on each system. The directory is created on first use.
Restart to load external file edits; no live folder watching, trash or revision history.
Web instead uses localStorage. Transfer layouts with `.framenote.json` export/import;
the two stores are not synchronized. See [preset format](PRESET_FORMATS.md).

Filenames use ASCII kebab-case with Latin accents simplified, a 180-character
base limit, reserved-name protection and case-insensitive collision suffixes.
The original name and stable ID remain in JSON. Old ID filenames are read and
renamed only when saved. Rename/save failures preserve previous files; external
changes to the edited file require restarting before saving again.

JPG quality remains in the Chromium profile (normally
`~/Library/Application Support/FrameNote` on macOS). Metadata removal starts
on each session. Separate configuration files are not implemented.
Open photos and unsaved layouts are session-only: closing or quitting ends them
without confirmation. Tests use isolated profiles and preset directories.

## Window and fonts

macOS starts a centered window targeting 2240 × 1560 logical units, capped to the
available work area of the display containing the pointer. Geometry is not restored.
Native window controls sit above the editor toolbar; About is in the app menu.

Desktop lists installed fonts in System; restart after installing fonts. Bundled
families take precedence on matching names. Missing families retain their saved
name, show Unavailable and render with Montserrat. See [font details](FONT_LIBRARY.md).
