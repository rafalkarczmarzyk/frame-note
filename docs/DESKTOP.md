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

## Welcome

Desktop shows About once on the first launch of each product version, including
the first launch of a new profile. Close it with X, Escape or the backdrop.
The profile remembers the displayed product version in localStorage under
`framenote.about-shown-version`; rebuilds of the same version
do not show it again. This technical state is outside config.json, and there is
no startup toggle. If profile storage is unavailable, the app remains usable but
About may reappear on the next launch. About remains available in the application
menu. Web opens About only when requested.

## Updates

Desktop checks the public GitHub releases Atom feed at every startup by default; turn this off in Settings. A newer version produces a persistent,
dismissible notice at the top of the workspace. **View release** opens that
release in the system browser; download and replace the app manually.
**FrameNote → Check for Updates…** also starts a check. There is no automatic
installer or update button in About. Network errors do not interrupt editing.
Web has no release checker or update notice. Update notices share a vertical
workspace stack with configuration warnings and application errors, below the
toolbar and native window controls. Each dismissible notice closes independently.

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
the two stores are not synchronized. One schema reads historical labels 1/2/3,
fills missing optional settings, and saves the current shape as v1. There are no
version-specific migrations or backups. See [preset format](PRESET_FORMATS.md).

Filenames use ASCII kebab-case with Latin accents simplified, a 180-character
base limit, reserved-name protection and case-insensitive collision suffixes.
The original name and stable ID remain in JSON. Old ID filenames are read and
renamed only when saved. Rename/save failures preserve previous files; external
changes to the edited file require restarting before saving again.

Desktop preferences live in `~/FrameNote/config.json`, next to the presets
folder. The file uses configuration format v1, independently of the app and
preset versions. JPG quality is imported once from the Chromium profile if no
configuration exists (default 95). The last **Remove all metadata** choice is
also remembered (default on); both controls remain in Export settings.
Other metadata group choices remain session-only. Tests use isolated data paths.

Open **FrameNote → Settings…** (**Cmd+,** on macOS) to change undo steps per
photo (1–1000, default 100), window restoration and startup update checking
(window restoration off and startup update checking on by default). Windows/Linux also use the application menu.
**Save** writes and closes; **X**, **Cancel** or Escape discards the draft.
Use the info icons for option descriptions (hover or keyboard focus). Undo steps
uses the shared numeric control: type a value, click its arrows or drag either
arrow vertically. Invalid out-of-range drafts restore the last valid value on
blur; fractional history limits are rejected when saving. While saving, controls
and closing are disabled. Clicking
outside keeps the form open. **Restore defaults** changes only the three fields
in the form, and requires Save. Lowering the history limit immediately discards
older steps after a successful save; increasing it cannot restore them.
The shared 64 MiB history budget still applies. Export quality, metadata choices,
photos, presets and history contents are not reset by Restore defaults.

**Show configuration file** reveals the file in your system file manager.
Manual edits are read and validated only on restart. The last app save wins:
saving Settings, export preferences or window geometry while the app is running
may overwrite manual edits. There is no live reload or conflict merging.
Writes use a temporary file and rename. Invalid/unreadable or unsupported files
start the app with defaults and a dismissible workspace notification without
blocking editing. **Open Settings** opens full diagnostics and recovery; closing
the notification does not remove the warning from Settings. Saving an
invalid file from Settings requires explicit confirmation and preserves a
`.backup` copy; newer formats cannot be overwritten by this app.

The v1 schema requires `version: 1`; other preferences may be omitted and receive
the documented defaults. Additional fields at the root and in window geometry
are accepted, ignored by the app and retained when saving known preferences or
updated window bounds. Invalid known types, out-of-range values and unsupported
format versions are rejected. Stored window geometry, when present, requires
all known bounds, display ID and maximization fields. Additive settings stay in
v1; change the format number only when structure or meaning requires conversion.
Open photos and unsaved layouts are session-only: closing or quitting ends them
without confirmation. Tests use isolated profiles and preset directories.

## Window and fonts

Enable window restoration in Settings to restore the last normal position and
size. It is off by default. The app uses the saved display, or the primary
display if it was disconnected. Without saved bounds, it opens a centered
window on the pointer display targeting 2240 × 1560 logical units. On macOS,
both default and restored windows are capped at 85% of the display's work
area on each axis. Oversized saved windows are reduced and centered, and saved
maximization is skipped on startup. Windows and Linux restore maximization
and cap bounds to the full work area. Changing the option applies on the next
startup.
Native macOS window controls sit above the editor toolbar; About and Settings
are in the application menu.

Desktop lists installed fonts in System; restart after installing fonts. Bundled
families take precedence on matching names. Missing families retain their saved
name, show Unavailable and render with Montserrat. See [font details](FONT_LIBRARY.md).

## Configuration verification

Automated macOS desktop checks cover configuration creation and quality migration,
Settings save/cancel/X/Escape, numeric validation, persistence across restarts,
startup update checks, file reveal, failed saves and invalid-file recovery,
normal window bounds and maximization, and About once per product version.
They also check simultaneous configuration/update notifications at 800 and
1440 px, their position below the toolbar, Open Settings and independent dismissal.
Unit tests also cover disconnected-display fallback and unavailable profile storage.
Web visual regression and representative JPG export checks pass with these changes.
Physical external-monitor removal and native configuration behavior on Windows/Linux
remain manual verification items; the automated macOS results do not cover them.
