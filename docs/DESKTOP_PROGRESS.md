# Web / macOS implementation log

## Stage 1 — baseline

- Host: macOS 27.0.1, Apple Silicon (arm64), Node 22.15.1, pnpm 11.21.0.
- Corrected existing DESIGN_SYSTEM formatting and excluded generated visual reports
  from lint. Initial browser runs needed permission to bind local test ports.
- Unit baseline: 326 tests / 44 files passed. Full browser regression is running;
  async-images cancellation scenario has timed out and needs investigation.
- Initial target: local arm64 application, current bundled fonts and ZIP batch
  output. Public signing/notarization and Netlify production access remain external
  dependencies, not assumed permissions or completed work.

## Stage 2 — Electron proof

- Electron 45.1.0 selected: reuse Chromium rendering and JavaScript tooling.
  Tauri would require verification against the system WebKit and an additional
  Rust build toolchain. Size tradeoff accepted for the first local build.
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
