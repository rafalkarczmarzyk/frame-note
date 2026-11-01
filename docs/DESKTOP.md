# FrameNote on macOS

The first desktop build targets Apple Silicon (arm64). It uses Electron and the
same editor, image renderer, presets and bundled fonts as the web application.
It runs locally without a development server or an internet connection.
Intel Macs and older macOS releases have not been verified.

The initial window targets 2240 × 1560 logical units, centered in the available
work area of the display containing the pointer. Each dimension is capped to
that work area so the window fits around the menu bar and Dock. Window size and
position are not restored between launches.

On macOS a compact 28 px title bar sits above the editor toolbar.
The toolbar has equal 6 px padding on all four sides (49 px total height,
including its bottom border).
It uses the toolbar background, a centered FrameNote label and native macOS window
controls. Dragging and double-clicking the title bar use the system's window
behavior. The toolbar starts with Add photos, without a duplicate logo. Open the
About screen from FrameNote → About FrameNote in the macOS menu bar.
The web application has no extra title bar and keeps its clickable logo.

## Development and packaging

From the repository root, install with `pnpm install`. If installation policy
skips Electron's binary download, run `node node_modules/electron/install.js`.

- `pnpm dev`: web app on port 3000.
- `pnpm build`: web output in `apps/web/dist`.
- `pnpm desktop`: build and launch the desktop app.
- `pnpm desktop:build`: build the desktop renderer and preset file adapter.
- `pnpm desktop:clean`: remove the generated `release/` directory.
- `pnpm test:desktop`: integration smoke test of a previously built desktop.
- `pnpm desktop:package`: create `release/FrameNote-darwin-arm64/FrameNote.app` and
  `release/FrameNote-macOS-arm64.dmg`.

Both packaging commands (`desktop:package` and `desktop:package:signed`) clean
all of `release/` before typechecking and building. A failed packaging attempt
therefore leaves no previous app or DMG to mistake for a new build. The ordinary
`desktop:build` command leaves `release/` alone; it refreshes the renderer and
preset adapter used during development.

- `node scripts/verify-desktop-assets.mjs`: compare bundled font/license files.

The desktop smoke test imports seven original photos offline, saves a JPG and ZIP
through automated native dialog responses, checks cancellation and validates
renderer isolation. It restarts the application to verify saved presets and JPG
quality. Each run starts with a missing user-data directory inside an isolated
temporary profile, checking first-launch initialization.
It also checks the title bar, toolbar layout at 1440 and 800 px, menus,
minimize/restore and full-screen transitions. `pnpm test:desktop --chrome-only`
runs only these window checks. `--skip-native-transitions` explicitly omits
minimize/restore/fullscreen checks when the graphical session cannot focus the
app; it does not count those checks as verified.
It can target a packaged executable through the `FRAMENOTE_PACKAGED` environment
variable. It requires a macOS graphical session. Run desktop and web tests
sequentially to avoid competing for application focus.

## Installing the local build

Copy FrameNote.app to a user-writable Applications folder, then open it normally.
The local build is ad hoc signed and not notarized. It is intended to run on
other Apple Silicon Macs as well as the build machine. Downloaded or transferred
builds may require approval in System Settings → Privacy & Security → Open Anyway
after the first launch attempt. This is not Apple Developer ID trust; do not
interpret a Gatekeeper rejection as a failed integrity check. Cross-machine launch
must still be tested before declaring a build verified for distribution.
Do not disable system protections. Public distribution requires Apple signing,
notarization and resolution of the RetiredDisplay redistribution license.

To update manually, quit FrameNote and replace the app bundle. Starting with
`0.1.0-beta`, user presets are individual v1 JSON files in
`~/FrameNote/presets/<preset-name-in-kebab-case>.json`. The original name and stable ID stay inside each JSON. Filenames use ASCII
kebab-case, with Polish/Latin accents simplified, unsafe characters replaced by
hyphens, a 180-character base limit and case-insensitive collision suffixes
(`-2`, `-3`). Reserved system names receive a `preset-` prefix. Older ID filenames
are read unchanged and renamed only when that particular preset is saved.
Name changes rename the file; failed writes restore prior files. External changes
to a file being updated require a restart before saving again.
The application creates this directory on
first use, reads it at startup and persists edits immediately. Restart to pick up
manual file edits. Delete removes the file permanently; there is no revision
history or trash. A failed save reports an error and does not appear as saved.

Web uses the existing localStorage key `framenote.presets.v1`. Both platforms
share the exact same v1 preset JSON and Zod parser. Use preset export/import to
transfer layouts. Pre-beta data is unsupported; no cleanup or migration is
performed. Users can clear obsolete browser data themselves if necessary.

JPG quality stays in the Chromium profile (normally
`~/Library/Application Support/FrameNote/Local Storage`). Metadata removal starts
enabled each session. Configuration files and cloud sync are not implemented.
Tests launched with `--user-data-dir` put presets under that isolated profile's
`FrameNote/presets` directory, leaving the real home directory untouched.

Open photos and unsaved per-photo edits are session-only. Closing an open session
asks for confirmation, including sessions whose images have already been exported.
The built-in font catalog is available offline. Installed font families are listed in the System category. On macOS the
application reads the native AppKit font catalog once at startup, then loads
visible previews and selected faces locally. Restart after installing fonts.
Bundled families take priority when names match; unavailable faces fall back to
Montserrat while the selector retains the preset name and shows Unavailable.

## Web deployment

`netlify.toml` builds from the workspace root and publishes `apps/web/dist`.
The root `packageManager` field pins pnpm. Netlify skips the Electron binary
download because web builds do not need it. Existing Netlify dashboard base/package
settings must agree with this configuration. Preserve the existing site, domain
and production branch; validate a Deploy Preview before changing production.
No remote Netlify site configuration has been read or changed during local setup.

## Architecture

- `apps/web`: browser entry point.
- `apps/desktop`: isolated Electron main/preload and desktop entry point.
- `packages/editor`: shared React editor, session and Canvas rendering.
- `packages/core`: models and pure domain logic.
- `public`: single source of bundled fonts and shared static artwork.

The desktop renderer has no Node API. A narrow bridge handles native output and
menu/session events. Its entry point maps the OS to a `PlatformProvider` value
(`macos`, `windows` or `linux`); the web entry point explicitly supplies `web`.
Shared UI reads `usePlatform()` flags, independently of the platform services
used for saving and storage. Windows/Linux values and Storybook previews prepare
the UI only; native packages and behavior on those systems remain unverified.
Output uses a native Save dialog and writes through a
temporary file before renaming. Opening photos/graphics/presets uses the native
file chooser already provided by HTML inputs; drag-and-drop follows shared import
validation. Saved presets use the app's persistent Chromium storage.

## DMG installation window

`pnpm desktop:package` also prepares a 640 × 400 Finder window with the app,
an Applications shortcut, and a FrameNote background with drag-to-install guidance.
Open the DMG, drag FrameNote into Applications, eject the image, then launch the
copy in Applications. Quit the existing app before replacing it during an update.

Packaging requires macOS and a graphical Finder session.
Allow the packaging terminal to control Finder if macOS requests Automation access.
The committed background PNG can be regenerated from `apps/desktop/installer/background.swift` at 2×
resolution using system fonts with Swift command-line tools. `scripts/create-dmg-desktop.mjs` stages an HFS+
image, saves its Finder layout and verifies the
compressed read-only image before replacing the previous DMG. Temporary images
are detached and removed after packaging. The app is signed before packaging and
verified again from the final read-only DMG before it replaces the output file.
The DMG is not notarized.

Manual packaging acceptance checks:

1. Open the final DMG and inspect the background, icon positions and labels.
2. Check that Applications points to `/Applications` and the image is read-only.
3. Copy the app to Applications, eject the image and launch the installed copy.
4. Quit the app, replace it with a new build and verify saved presets remain.
5. Transfer/download the DMG on a different Apple Silicon Mac, install and launch
   the app. If Gatekeeper blocks an unidentified developer, use the per-app Open
   Anyway approval in Privacy & Security. Do not disable Gatekeeper or re-sign the
   installed copy. Record the macOS version and outcome. A damaged-app error or a
   failed `codesign --verify --deep --strict` is a packaging failure, not acceptance.

## Xcode detection

Packaging respects an explicit `DEVELOPER_DIR` and reports errors for that choice.
Otherwise it tries the active developer directory, then Xcode installations in
`/Applications` and `~/Applications`. It resolves tools with `xcrun` and exposes
the selected `actool` to Electron Packager without changing global `xcode-select`.
Icon Composer requires macOS 26 and actool 26 or newer; older or missing tools
use the existing `.icns` icon. A failure compiling the chosen icon fails the build.

## Code signing

Use the same `DEVELOPER_ID` convention as the Voxel Tycoon CLI:

```sh
security find-identity -v -p codesigning
export DEVELOPER_ID='Exact certificate name or SHA-1 from the list above'
pnpm desktop:package:signed
```

The signed command requires an exact, valid identity with its private key in the
macOS keychain. It fails rather than falling back to an unsigned or ad hoc build.
The ordinary `pnpm desktop:package` command signs ad hoc without a certificate,
Apple account or timestamp service, even when `DEVELOPER_ID` is set. Both commands
write the same app and DMG paths; the most recent successful build determines their
signing state.

The certificate mode uses a secure timestamp and Hardened Runtime. The ad hoc mode
leaves Hardened Runtime disabled because its library validation requires a Team ID
that ad hoc signatures do not have. Both modes use the JIT entitlement needed by
V8 and sign nested code before the app bundle. The build verifies the whole app with `codesign --verify --deep --strict` before creating the DMG. The DMG itself
is not signed. The entitlement source is `apps/desktop/entitlements.plist`.
No certificate, private key or password is stored in the repository. macOS may ask
for permission to use the signing key during packaging.

This command does **not** notarize or upload the app to Apple. A local/self-signed
certificate does not provide Apple Developer ID trust. Public distribution with
normal Gatekeeper approval requires an Apple-issued Developer ID Application
certificate and notarization; a successful local signature check alone does not
establish this. See [Apple's notarization documentation](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution).

If macOS reports `this identity cannot be used for signing code`, the selected
certificate/key is not usable for this operation even if `security find-identity`
lists it. Resolve the certificate/key setup before retrying; the packaging command
does not weaken certificate validation or change keychain trust settings.

DMG layout setup retries Finder’s transient busy error (`-15260`) up to five
times with short backoff. Each AppleScript invocation has a 30-second timeout;
permission and other errors are reported immediately.
