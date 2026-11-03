# Development

[Back to README](../README.md) · [Desktop setup and packaging](DESKTOP.md)

## Setup

Use Node.js from [`.nvmrc`](../.nvmrc) and the pnpm version pinned in
[`package.json`](../package.json). Run commands from the repository root.

```sh
nvm install
nvm use
corepack enable
pnpm install --frozen-lockfile
```

With dependencies installed, `pnpm run dev` serves web on port 3000 and
`pnpm run desktop` launches Electron with live UI updates from a loopback Vite server on port 3001. If Electron installation was
skipped, run `node node_modules/electron/install.js`.

Vite and Storybook listen on `0.0.0.0`: use the printed network address to open
them from another device on your LAN. Web uses port 3000, Storybook 6006; the
web development server fails if its port is occupied.

Desktop preview is local to this computer. Closing the window or pressing Ctrl+C
stops Electron and the preview server. Native restarts reset open photos; React
Fast Refresh preserves state where the edited module supports it. Fix syntax
errors to resume updates. Port 3001 must be free.

Use `pnpm run desktop:preview` to compile and launch once without live updates.
`pnpm run desktop:build` creates the standalone app at
`release/FrameNote-darwin-arm64/FrameNote.app` on macOS Apple Silicon. Open that
app in Finder; the `release/dev` directory is only an internal Electron runtime.
`pnpm run desktop:compile` prepares renderer/adapter files for tests or `desktop:dist`
without creating an app bundle.
`pnpm run test:desktop:dev` checks live updates and native restarts in a macOS
graphical session, with the same elevated-execution requirement as desktop tests.
It temporarily edits and restores the empty-canvas text and preload source;
run it without concurrent source edits.

## Stack

The stack combines React, TypeScript, Vite, Tailwind CSS, Konva, Tiptap,
ExifReader, and Radix UI. Unit tests use Vitest; browser tests use Playwright.
Shared components and design tokens are documented in Storybook.

## Commands

`pnpm run <script>` executes a package.json script. `pnpm exec <tool>` executes a
project tool such as Playwright. The shorter `pnpm <script>` form is also valid.

| Command                           | Purpose                                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `pnpm run dev`                    | Start web development server on port 3000                                                               |
| `pnpm run build`                  | Typecheck and build web into apps/web/dist                                                              |
| `pnpm run preview`                | Preview the built web app                                                                               |
| `pnpm run typecheck`              | Check workspace TypeScript                                                                              |
| `pnpm run lint`                   | Check ESLint rules                                                                                      |
| `pnpm run format`                 | Format repository files                                                                                 |
| `pnpm run format:check`           | Check repository formatting                                                                             |
| `pnpm run check:tokens`           | Check semantic UI color tokens                                                                          |
| `pnpm run check:version`          | Check manifest versions and changelog                                                                   |
| `pnpm run version:set <version>`  | Synchronize product versions in workspace manifests                                                     |
| `pnpm run check`                  | Formatting, versions, tokens, lint, types, aggregate tests and web build; excludes native desktop tests |
| `pnpm run test`                   | Unit, E2E, all visual UI projects and Glass suites; excludes native desktop tests                       |
| `pnpm run test:unit`              | Unit tests                                                                                              |
| `pnpm run test:e2e`               | Browser flows in Chromium and WebKit                                                                    |
| `pnpm run test:e2e:ui`            | Open browser test UI                                                                                    |
| `pnpm run test:e2e:report`        | Open browser test report                                                                                |
| `pnpm run test:glass-trial`       | Build Storybook and check Glass rendering                                                               |
| `pnpm run test:visual`            | Default Chromium desktop UI regression                                                                  |
| `pnpm run test:visual:review`     | Open visual regression test UI                                                                          |
| `pnpm run test:visual:report`     | Open visual regression report                                                                           |
| `pnpm run test:visual:update`     | Update explicitly selected visual references; requires --project and --grep                             |
| `pnpm run storybook`              | Start Storybook on port 6006                                                                            |
| `pnpm run build-storybook`        | Build static Storybook                                                                                  |
| `pnpm run desktop`                | Live desktop preview; UI refreshes on save                                                              |
| `pnpm run desktop:build`          | Create a runnable FrameNote.app on macOS Apple Silicon, without installation or DMG                     |
| `pnpm run desktop:compile`        | Compile renderer and adapter for tests and platform-specific distribution                               |
| `pnpm run desktop:preview`        | Compile and launch once without live updates                                                            |
| `pnpm run desktop:install`        | Build and install locally on macOS Apple Silicon; supports --user and --open                            |
| `pnpm run desktop:package`        | Clean release, build and package local macOS arm64 app and DMG                                          |
| `pnpm run desktop:package:signed` | Local macOS packaging using explicit DEVELOPER_ID; no notarization                                      |
| `pnpm run desktop:dist`           | Package a previously built desktop for the current system into release/ci; does not build the renderer  |
| `pnpm run desktop:clean`          | Remove release outputs                                                                                  |
| `pnpm run test:desktop`           | Native macOS smoke test; requires a built desktop and graphical session                                 |

Pass options to the main commands instead of using separate shortcuts: `pnpm run lint --fix`,
`pnpm run test:unit --watch`, `pnpm run test:e2e --grep "Photo export"`, or
`pnpm run test:e2e:ui --grep "Photo export"`.

Install browser engines before running E2E tests:

```sh
pnpm exec playwright install chromium webkit
pnpm run check
```

Playwright serves the production build on port 4173. Coverage includes
photo import and multi-photo sessions, metadata, layers, inline graphics, presets, positioning,
and JPG export. Export checks inspect dimensions, encoded size, metadata removal,
sRGB colors, orientation, and rendered pixels.

Visual export baselines are platform-specific. Review actual/expected/diff images
before deliberately updating them with
`pnpm run test:e2e --update-snapshots --project=chromium`. UI-only changes should not require new
export baselines. Automated WebKit tests do not replace manual Safari testing.

### Storybook and design system

Open [localhost:6006](http://localhost:6006) after running `pnpm run storybook`.
Stories are grouped by purpose, including **Foundations**, **Actions**,
**Fields**, **Sidebar & panels**, and **Screens**. `Screens/TestPhotos` exercises the real editor with original photo
fixtures. Application and stories share components and CSS.

UI colors are defined in `packages/editor/src/index.css` and consumed through semantic tokens.
`pnpm run check:tokens` checks this convention. The accessibility addon supports
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

## Packaging

Local macOS packaging rebuilds and creates both an app and DMG:

```sh
pnpm run desktop:package
```

The separate cross-platform packaging path requires a fresh build first:

```sh
pnpm run desktop:compile
pnpm run desktop:dist
```

It produces `release/ci/*.dmg` on macOS arm64, `*.exe` on Windows x64 or
`*.AppImage` on Linux x64. It does not install the app or publish a release.
Local `desktop:install` remains a macOS Apple Silicon command, and builds and
installs without creating a DMG. Details and signing options: [desktop guide](DESKTOP.md).

## Desktop verification

`pnpm run test` and `pnpm run check` do **not** launch the native desktop suite.
After building the desktop, run it separately from a graphical macOS session:

```sh
pnpm run desktop:compile
pnpm run test:desktop
```

Run desktop and browser tests sequentially. In Codex the first desktop test
attempt requires elevated execution; never remove environment markers to bypass
the guard. See [desktop test requirements](DESKTOP.md#development-and-packaging).

## UI visual regression

```sh
pnpm run test:visual
pnpm run test:visual --all-projects
pnpm run test:visual:review
pnpm run test:visual:report
```

Review expected/actual/diff before updating intentionally changed scenes:

```sh
pnpm run test:visual:update --project chromium-desktop --grep 'left margin hover'
```

References depend on OS/browser profile; do not replace macOS references with
outputs from another platform. See [visual regression workflow](UI_VISUAL_REGRESSION_PLAN.md).

## Versioning

The version is recorded in [package.json](../package.json) and [CHANGELOG.md](../CHANGELOG.md). **1.0.0** is reserved for the first
finished stable version. The previous alpha designation `1.0.0-alpha.1` was
normalized to `0.0.3-alpha`; historical commit contents are unchanged.

To build a specific version, check out its existing `v<version>` tag and follow Setup above.
User presets use the same v1 JSON and Zod schema on both platforms. Web keeps
localStorage; macOS uses `~/FrameNote/presets`. No old preset migration is provided.

During beta, compatible fixes increment PATCH (`0.1.0-beta` → `0.1.1-beta`);
features and incompatible changes increment MINOR (`0.1.1-beta` → `0.2.0-beta`),
resetting PATCH. Mixed tasks use the highest required increment. Channel labels
have no extra counter: use `-alpha`, `-beta` and `-rc`. This is our
[SemVer](https://semver.org/) prerelease convention; incompatible changes before
1.0 still require migration and changelog coverage.

About displays the product version, build commit and `dirty` for local changes.
Source archives without Git metadata show `unknown`. To prepare a version, run
`pnpm run version:set <version>`, add its changelog section, then run
`pnpm run check:version --base=<previous-version-commit>`. The regular `pnpm run check`
includes manifest and changelog consistency checks.

An authorized commit or merge of a completed application task into `master`
includes one version increment, dated changelog section and local tag.
Development branch commits do not bump versions. See
[maintain-versioning](../.agents/skills/maintain-versioning/SKILL.md).
Historical milestones map pre-MVP to `v0.0.1-alpha` and MVP to `v0.0.2-alpha`;
their target commits are unchanged. Historical manifests are not rewritten.

Version tags on master trigger GitHub Actions to build macOS Apple Silicon DMG,
Windows x64 portable EXE and Linux x64 AppImage packages. Successful builds upload and verify all
installers, then publish the GitHub Release automatically. A local tag alone does not upload or
publish anything. See [desktop release workflow](DESKTOP.md#github-releases).

## Web deployment

[netlify.toml](../netlify.toml) runs `pnpm run build` from the workspace root and
publishes `apps/web/dist`. Electron downloads are skipped for web deployment.
A local build does not deploy the site. See [deployment notes](DESKTOP.md#web-deployment).
