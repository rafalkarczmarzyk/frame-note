# Development

[Back to README](../README.md) · [Desktop installation](DESKTOP.md)

## Setup

Use Node.js from [`.nvmrc`](../.nvmrc) and pnpm pinned in
[`package.json`](../package.json). Commands run from the repository root.
With nvm installed:

```sh
nvm install
nvm use
corepack enable
pnpm i
```

Choose `pnpm dev` for web on port 3000 or `pnpm desktop` for Electron with live
UI updates on 127.0.0.1:3001. If Electron's binary download was skipped, run
`node node_modules/electron/install.js`. Web and Storybook listen on the LAN;
desktop live preview is loopback-only. Their ports must be free.

Desktop UI uses Fast Refresh where supported. Main/preload and preset-adapter
changes restart Electron and reset the photo session. Closing the window or
Ctrl+C stops the app and server. `desktop:preview` builds and starts once offline;
`desktop:build` creates a standalone macOS app without installation or DMG.
The ignored `release/dev` directory is the cached, private FrameNote runtime,
not the application to distribute; the installed Electron dependency is unchanged.

`test:desktop:dev` diagnoses HMR/restarts, temporarily editing and restoring
sources. Use it only for launcher changes, without concurrent source edits,
and with the same graphical-session access as the native smoke test.

## Stack

The stack combines React, TypeScript, Vite, Tailwind CSS, Konva, Tiptap,
ExifReader, and Radix UI. Vitest covers unit, integration and tooling tests; browser tests use Playwright.
Shared components and design tokens are documented in Storybook.

## Commands

`pnpm <script>` executes a package.json script. `pnpm exec <tool>` executes a
project tool such as Playwright. The shorter `pnpm <script>` form is also valid.

| Command                       | Purpose                                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                    | Start web development server on port 3000                                                               |
| `pnpm build`                  | Typecheck and build web into apps/web/dist                                                              |
| `pnpm preview`                | Preview the built web app                                                                               |
| `pnpm typecheck`              | Check workspace TypeScript                                                                              |
| `pnpm lint`                   | Check ESLint rules                                                                                      |
| `pnpm format`                 | Format repository files                                                                                 |
| `pnpm format:check`           | Check repository formatting                                                                             |
| `pnpm check:tokens`           | Check semantic UI color tokens                                                                          |
| `pnpm check:version`          | Check manifest versions and changelog                                                                   |
| `pnpm version:set <version>`  | Synchronize product versions in workspace manifests                                                     |
| `pnpm check`                  | Formatting, versions, tokens, lint, types, aggregate tests and web build; excludes native desktop tests |
| `pnpm test`                   | Vitest, one Chromium export smoke and six Chromium desktop screenshots; excludes native desktop tests   |
| `pnpm test:unit`              | All Vitest tests: unit, integration and tooling                                                         |
| `pnpm test:e2e`               | One representative JPG export in Chromium                                                               |
| `pnpm test:e2e:ui`            | Open browser test UI                                                                                    |
| `pnpm test:e2e:report`        | Open browser test report                                                                                |
| `pnpm test:visual`            | Default Chromium desktop UI regression                                                                  |
| `pnpm test:visual:review`     | Open visual regression test UI                                                                          |
| `pnpm test:visual:report`     | Open visual regression report                                                                           |
| `pnpm test:visual:update`     | Update explicitly selected visual references; requires --project and --grep                             |
| `pnpm storybook`              | Start Storybook on port 6006                                                                            |
| `pnpm build-storybook`        | Build static Storybook                                                                                  |
| `pnpm desktop`                | Live desktop preview; UI refreshes on save                                                              |
| `pnpm desktop:build`          | Create a runnable FrameNote.app on macOS Apple Silicon, without installation or DMG                     |
| `pnpm desktop:compile`        | Compile renderer and adapter for tests and platform-specific distribution                               |
| `pnpm desktop:preview`        | Compile and launch once without live updates                                                            |
| `pnpm desktop:install`        | Build and install locally on macOS Apple Silicon; supports --user and --open                            |
| `pnpm desktop:package`        | Clean release, build and package local macOS arm64 app and DMG                                          |
| `pnpm desktop:package:signed` | Local macOS packaging using explicit DEVELOPER_ID; no notarization                                      |
| `pnpm desktop:dist`           | Package a previously built desktop for the current system into release/ci; does not build the renderer  |
| `pnpm desktop:clean`          | Remove release outputs                                                                                  |
| `pnpm test:desktop`           | Native macOS smoke test; requires a built desktop and graphical session                                 |

Pass options to the main commands instead of using separate shortcuts: `pnpm lint --fix`,
`pnpm exec vitest` or `pnpm test:e2e:ui`.

Install browser engines before running E2E tests:

```sh
pnpm exec playwright install chromium
pnpm check
```

Playwright serves the production build on port 4173. Its one browser test imports a representative wildlife photo, exports a JPG and compares the decoded image with one snapshot. Other browser, batch, clipboard, drag/drop and native window interactions are checked manually when their behavior changes.

The JPG export is compared with a decoded PNG snapshot. To intentionally create or update it, run `pnpm test:e2e --update-snapshots` and review the image before accepting it. The normal run never writes baselines.

### Storybook and design system

Open [localhost:6006](http://localhost:6006) after running `pnpm storybook`.
Stories are grouped by purpose, including **Foundations**, **Actions**,
**Fields**, **Sidebar & panels**, and **Screens**. `Screens/TestPhotos` exercises the real editor with original photo
fixtures. Application and stories share components and CSS.

UI colors are defined in `packages/editor/src/index.css` and consumed through semantic tokens.
`pnpm check:tokens` checks this convention. The accessibility addon supports
component review; it is not a complete accessibility audit.

The caption library offers 25 Google Fonts families, with category
filters and local fonts loaded on demand. See [font delivery and licenses](FONT_LIBRARY.md).
Montserrat is bundled through `@fontsource-variable/montserrat` and also styles
interface headings. Font licenses accompany the bundled families.

### Repository structure

```text
apps/web/           Browser entry point
apps/desktop/       Electron main/preload and desktop entry point
packages/core/src/  Photo, document, metadata, and preset models
packages/editor/src/
  components/       Shared UI, layout, and brand components
  features/
    caption/        Content editor, geometry, rendering, and export
    photo/          Import, metadata, and workspace composition
    presets/        Preset controls and local persistence
  lib/              Shared utilities and preferences
docs/               Product, design, and verification documentation
e2e/                Playwright flows and export baselines
tests/fixtures/     Original test photos and graphics
```

The desktop renderer has no Node API. An isolated, sender-validated IPC bridge
handles native output, presets and menus. Output uses a temporary file and rename;
packaged resources load through `framenote://app`, live preview through loopback.
Opening files uses HTML's native chooser and shared import validation.

## Packaging

Local macOS packaging rebuilds and creates both an app and DMG:

```sh
pnpm desktop:package
```

The separate cross-platform packaging path requires a fresh build first:

```sh
pnpm desktop:compile
pnpm desktop:dist
```

It produces `release/ci/*.dmg` on macOS arm64, `*.exe` on Windows x64 or
`*.AppImage` on Linux x64. It does not install the app or publish a release.
Local `desktop:install` remains a macOS Apple Silicon command, and builds and
installs without creating a DMG. Signing and packaging requirements are below; user installation is in the [desktop guide](DESKTOP.md).

## Desktop verification

`pnpm test` and `pnpm check` do **not** launch the native desktop suite.
After building the desktop, run it separately from a graphical macOS session:

```sh
pnpm desktop:compile
pnpm test:desktop
```

Native test launchers set `FRAMENOTE_TEST_UPDATE_FEED=1` before application startup,
including restarts and distribution smoke tests. The update checker then uses a
local empty Atom feed and never sends update requests to GitHub. Unit tests inject
local feed responses for available versions, malformed data and network errors.

Run desktop and browser tests sequentially. In Codex the first desktop test
attempt requires elevated execution; never remove environment markers to bypass
the guard. See [desktop test requirements](../AGENTS.md#uruchamianie-desktopu-w-testach).

## UI visual regression

```sh
pnpm test:visual
pnpm test:visual:review
pnpm test:visual:report
```

Review expected/actual/diff before updating intentionally changed scenes:

```sh
pnpm test:visual:update --project chromium-desktop --grep 'metadata panel'
```

The suite has six full-window scenes in one Chromium desktop profile. A new browser test or profile requires explicit agreement to expand the suite. See [visual regression workflow](UI_VISUAL_TESTS.md).

### Test selection policy

- Test data rules, geometry and save failures at the lowest useful layer.
- Before adding a test, name the new failure it would catch and check existing coverage.
- Expand one of the six UI compositions instead of adding a screenshot for each control.
- Avoid fixed sleeps, retries that hide failures and automatic baseline acceptance.
- Keep one responsibility per scenario; fixtures must not reproduce implementation logic.
- Manually check drag/drop, focus and keyboard, clipboard, batch ZIP, other browsers
  and additional native window transitions when relevant. Native smoke covers
  four-photo JPG/ZIP, frame switching, resizing and fullscreen; other interactions remain manual.

## Versioning

The shared product version is authoritative in [package.json](../package.json).
To build a historical release, check out its `v<version>` tag and follow Setup.
Data compatibility is documented in [PRESET_FORMATS](PRESET_FORMATS.md).

For numbering, branch and changelog conventions use
[maintain-versioning](../.agents/skills/maintain-versioning/SKILL.md).

About displays the product version, build commit and `dirty` for local changes.
Prepared source archives recover the commit from `.framenote-source.json`;
without either source metadata or Git, the build shows `unknown`. To prepare a version, run
`pnpm version:set <version>`, add its changelog section, then run
`pnpm check:version --base=<previous-version-commit>`. The regular `pnpm check`
includes manifest and changelog consistency checks.

Changes accumulate under `Unreleased` across master commits and merges. Prepare
a versioned changelog section only when you explicitly decide to release. Use
the [prepare-release skill](../.agents/skills/prepare-release/SKILL.md) for the
version forecast, release notes and failed-build recovery.

## Web deployment

[netlify.toml](../netlify.toml) runs `pnpm build` from the workspace root and
publishes `apps/web/dist`. Electron downloads are skipped for web deployment.
A local build does not deploy the site. Validate a Deploy Preview before changing production;
Netlify dashboard base/package settings must agree with the repository configuration.

## Local macOS packaging

`desktop:package` and `desktop:package:signed` clean all of `release/` before
compiling; a failed attempt leaves no old app/DMG to mistake for a new build.
`desktop:build` creates `release/FrameNote-darwin-arm64/FrameNote.app` without
DMG or installation and preserves the dev runtime cache. `desktop:compile`
only refreshes renderer/adapter files. `desktop:dist` requires a fresh compile.

Local DMG packaging uses Finder automation in a graphical macOS session, a
640 × 400 installation window and the background generated by
`apps/desktop/installer/background.swift`. It verifies the staged app, read-only
DMG and signature before replacing the result. Allow Finder Automation if asked.
Check layout, Applications shortcut, installation outside the repository,
replacement preserving presets and launch on another Mac before distribution.
A signature/integrity failure is not a successful installation test.

### Xcode detection

An explicit `DEVELOPER_DIR` takes precedence; otherwise the scripts try the active
directory and Xcode under `/Applications` or `~/Applications`, without changing
`xcode-select`. Icon Composer requires macOS/actool 26; older tools use `.icns`.
Failure compiling the chosen icon fails the build.

### Code signing

Ordinary local packaging signs ad hoc, without an Apple account or certificate,
even when `DEVELOPER_ID` is set. For certificate signing:

```sh
security find-identity -v -p codesigning
export DEVELOPER_ID='Exact certificate name or SHA-1'
pnpm desktop:package:signed
```

The signed command requires the matching private key and fails without fallback.
It uses a timestamp and Hardened Runtime; ad hoc mode omits Hardened Runtime's
Team-ID-dependent library validation. Both retain V8 JIT entitlements and verify
nested code with `codesign --verify --deep --strict`. No keys are stored in Git.
The DMG is not signed; neither command notarizes or uploads to Apple. Normal
Gatekeeper trust requires Developer ID and notarization, beyond local integrity.

## GitHub Releases

The [workflow](../.github/workflows/desktop-release.yml) builds macOS arm64 DMG,
Windows x64 portable EXE and Linux x64 AppImage via `desktop:compile` then
`desktop:dist`. This path does not automate Finder. Standard hosted runners
need no signing secrets; platform limitations are in [DESKTOP](DESKTOP.md).

- Push master and its matching `v<product-version>` tag to trigger the release.
  Tag/version mismatches and commits outside master are rejected.
- All three binary builds/smoke tests and the source job must pass. Packages,
  the [source archive](SOURCE_DISTRIBUTION.md) and SHA256SUMS are uploaded to a
  temporary draft, then names, sizes and hashes are checked before publication.
- Publication is automatic after those checks: Latest, `prerelease=false`, even
  with a beta version suffix. Authorization to push a release tag must cover this.
- Manual runs produce seven-day Actions artifacts, not releases. Recovery creates
  a draft for review and requires the original successful source and binary jobs.
- Failed upload/verification leaves an unpublished draft. Published releases are
  never overwritten. A local tag alone does not publish.
- Infrastructure retry applies only when every failed job has a confirmed missing
  hosted runner: five-minute delay, at most four attempts including manual ones.
  Manual reruns cancel the pending retry; code, packaging and publication failures
  are not retried by that rule. Successful jobs and the tag remain unchanged.

CI startup/import/export checks are narrower than manual platform acceptance;
see the outstanding installation/font/persistence checks in DESKTOP.
