# FrameNote on macOS

The first desktop build targets Apple Silicon (arm64). It uses Electron and the
same editor, image renderer, presets and bundled fonts as the web application.
It runs locally without a development server or an internet connection.
Intel Macs and older macOS releases have not been verified.

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
- `pnpm desktop:build`: build just the desktop renderer.
- `pnpm test:desktop`: integration smoke test of a previously built desktop.
- `pnpm desktop:package`: create `release/FrameNote-darwin-arm64/FrameNote.app` and
  `release/FrameNote-macOS-arm64.dmg`.
- `node scripts/verify-desktop-assets.mjs`: compare bundled font/license files.

The desktop smoke test imports seven original photos offline, saves a JPG and ZIP
through automated native dialog responses, checks cancellation and validates
renderer isolation. It restarts the application to verify saved presets and JPG
quality. Each run starts with a missing user-data directory inside an isolated
temporary profile, checking first-launch initialization.
It also checks the title bar, toolbar layout at 1440 and 800 px, menus,
minimize/restore and full-screen transitions. `pnpm test:desktop --chrome-only`
runs only these window checks.
It can target a packaged executable through the `FRAMENOTE_PACKAGED` environment
variable. It requires a macOS graphical session. Run desktop and web tests
sequentially to avoid competing for application focus.

## Installing the local build

Copy FrameNote.app to a user-writable Applications folder, then open it normally.
The local build is unsigned and not notarized; Gatekeeper behavior for downloaded
or transferred builds has not been certified. This is not a public release.
Do not disable system protections. Public distribution requires Apple signing,
notarization and resolution of the Advercase redistribution license.

To update manually, quit FrameNote and replace the app bundle. Saved presets and JPG quality preferences are
stored in Electron's user-data directory (normally
`~/Library/Application Support/FrameNote/Local Storage`). Web and desktop have
separate stores. Metadata removal starts enabled in each new session. Use preset export/import to transfer layouts; no cloud sync or
session recovery is provided. Keep exported preset files as backups.

Open photos and unsaved per-photo edits are session-only. Closing an open session
asks for confirmation, including sessions whose images have already been exported.
The built-in font catalog is available offline. System font enumeration is not
part of this first build.

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
are detached and removed after packaging. This does not sign or notarize the app.

Manual packaging acceptance checks:

1. Open the final DMG and inspect the background, icon positions and labels.
2. Check that Applications points to `/Applications` and the image is read-only.
3. Copy the app to Applications, eject the image and launch the installed copy.
4. Quit the app, replace it with a new build and verify saved presets remain.

## Code signing

Use the same `DEVELOPER_ID` convention as the Voxel Tycoon CLI:

```sh
security find-identity -v -p codesigning
export DEVELOPER_ID='Exact certificate name or SHA-1 from the list above'
pnpm desktop:package:signed
```

The signed command requires an exact, valid identity with its private key in the
macOS keychain. It fails rather than falling back to an unsigned or ad hoc build.
The ordinary `pnpm desktop:package` command keeps its local unsigned behavior,
even when `DEVELOPER_ID` is set. Both commands write the same app and DMG paths;
the most recent successful build determines their signing state.

Electron Packager signs nested code before the app bundle, with a secure timestamp,
Hardened Runtime and the JIT entitlement needed by V8. The build verifies the whole
app with `codesign --verify --deep --strict` before creating the DMG. The DMG itself
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
