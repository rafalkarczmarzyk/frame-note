# Web / macOS implementation log

## Stage 1 — baseline

- Host: macOS 27.0.1, Apple Silicon (arm64), Node 22.15.1, pnpm 11.21.0.
- Corrected existing DESIGN_SYSTEM formatting and excluded generated visual reports
  from lint. Initial browser runs needed permission to bind local test ports.
- Unit baseline: 326 tests / 44 files passed. Initial browser checks exposed
  stale or unstable UI test steps; final verification is recorded in stage 7.
- Initial target: local arm64 application, current bundled fonts and ZIP batch
  output. Public signing/notarization and Netlify production access remain external
  dependencies, not assumed permissions or completed work.

## Stage 2 — Electron proof

- Electron 45.1.0 selected: reuse Chromium rendering and JavaScript tooling.
  Tauri would require verification against the system WebKit and an additional
  Rust build toolchain. This initial agent choice was discussed with the user;
  on 2026-10-31 the user authorized finishing stage 7 on the current Electron build.
- Sandboxed renderer with context isolation successfully loaded the existing
  production editor. JPEG Canvas encoding passed. No Node require in renderer.
- References: https://www.electronjs.org/docs/latest/tutorial/security and
  https://www.electronjs.org/docs/latest/api/dialog.

## Stages 3–4 — shared services and monorepo

- 328 unit tests passed after extraction and again after moving the code.
  Typecheck, web production build, color token checks, lint and Storybook build passed.
- Shared editor and pure domain code now live in packages/editor and packages/core;
  bundled preset artwork stays with the editor to avoid a core → editor dependency.
- Explicit Tailwind source scanning preserves classes after the move.
- Netlify configuration builds from the workspace root into apps/web/dist.
  No connected Netlify tool or local site binding was found; remote preview and
  production deployment have not been performed.
- Browser baseline was interrupted after existing timeouts (including obsolete
  Replace image wording). Final regression will distinguish these from regressions.
- Chromium desktop UI references pass. Compact/WebKit references include the old
  metadata/graphics toolbar instead of the already implemented unified Add button.
  Inspected expected/actual/diff; these references are not automatically updated.

## Stages 5–6 — macOS integration and fonts

- Separate web and desktop entry points mount the same editor. Desktop output
  uses a sender-validated isolated IPC bridge, native Save dialog and temporary
  file + rename. Cancellation does not touch the target. Presets use Chromium's
  persistent, app-specific local storage; no async disk store was needed.
- Open dialogs use the existing native file input, including graphics/presets.
  Native menus supply Open, Export, standard editing and window commands.
  Closing an open photo session requests confirmation (conservative: even exported
  sessions are considered open work). No session recovery is claimed.
- Offline desktop smoke test passed import, bundled fonts, real JPG output,
  cancellation and Node isolation.
- FontTools audit passed; 98 font/license files in the desktop renderer match
  shared public assets byte-for-byte. Known Prata/Advercase glyph and Advercase
  redistribution-license limitations remain as documented in FONT_LIBRARY.md.
- System fonts are not implemented in this first local build. Preset format and
  font identifiers remain shared; no migration subsystem was added.

## Stage 7 — local packaging and regression

Status: complete for the local Apple Silicon build, 2026-10-31.

- 330 unit tests passed. Desktop smoke test passed offline import, JPG output,
  cancellation without modifying the previous output, invalid filename rejection,
  seven-photo ZIP, source dimensions, metadata removal, preset persistence and
  JPG quality persistence across restart.
  Tests use an isolated temporary user profile and automated native dialog responses.
- Seven original fixtures produced a 22,487,321-byte ZIP with seven entries.
  Packaged-app post-export memory sample (KiB working set / peak): Browser
  278608 / 328816, GPU 789280 / 864464, Utility 49776 / 49824, renderer
  1114144 / 1410944.
  These process values can include shared pages and are not an additive total or
  a memory guarantee for larger rolls. No Tauri performance comparison was made.
- Current unsigned arm64 .app and DMG built; hdiutil integrity verification passed.
  A copy installed outside the repository passed the complete desktop test without
  a dev server. Its previously nonexistent data directory was created on first
  launch; preset and quality persistence passed after restarting that executable.
- Existing web tests now use atom-safe caption replacement, current UI labels,
  explicit export quality for image baselines, and current Glass Storybook IDs.
  Add content restores focus to its trigger when closing or switching panels.
- Reviewed all 11 stale UI references (5 compact Chromium, 6 WebKit) against
  expected/actual/diff and promoted only the known earlier unified Add toolbar
  change. Reviewed their Git image differences again. Export JPG references and
  the current primary Chromium UI references were not modified.
- Final verification: 330 unit tests; all 180 E2E cases verified across Chromium
  and WebKit; 18/18 visual UI scenes; 12/12 Glass rendering/export tests; web,
  desktop and Storybook production builds; formatting, tokens, lint and typecheck.
- The full pnpm check invocation initially returned nonzero for four Chromium E2E
  cases (176 passed). After stabilizing chooser/radio keyboard activation and
  asserting the caret position before a drop, all four passed on targeted rerun.
  The affected editor cases also passed separately in WebKit. No JPG pixel
  assertions or export reference images were relaxed or changed. This was not
  reported as a single clean pnpm check run.
- Glass has its own output directory so running it preserves E2E failure reports.
  Static checks were repeated after the final changes and passed.
- FontTools audit passed and 98 bundled font/license files matched shared assets.
  Python audit dependencies remain temporary tooling, not application dependencies.

## Stage 8 — external dependencies

Netlify preview/production access is unavailable through connected tools or a
local CLI/site binding. No remote deployment or push was performed. Public macOS
signing/notarization is not configured. These are uncompleted external steps;
the local application and build configuration do not imply published releases.
