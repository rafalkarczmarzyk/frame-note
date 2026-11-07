# Layer dragging benchmark

Manual diagnostic tool for stage 1 of
[the PoC](../../docs/plans/live-drag-rendering-poc.md). It does not add regression
scenes or change ordinary builds. Run commands from the repository root.

```sh
node scripts/measure-layer-drag.mjs --headed
```

Requires installed dependencies and Playwright Chromium
(`pnpm exec playwright install chromium`). The runner builds a production web
bundle with `VITE_DRAG_DIAGNOSTICS=1`, serves it on loopback port 4193, imports the
existing wildlife photo and deterministic preset v1 fixtures, and replays the
same pointer path in both preview modes. The Navigator thumbnail stays paused
in both variants so its cost does not obscure the composition comparison; the
full variant is not an exact recreation of all behavior before `a270c3a`. It closes the browser/server afterward.
The generated web bundle remains diagnostic: run `pnpm build` before normal web
use or distribution. Do not publish the diagnostic bundle.

Options:

- `--headed`: use a visible browser. Recommended for GPU measurements; headless
  can select software rendering. Actual GPU/feature status is saved, not inferred.
- `--scenes=plain,effects,glass-blend,under-glass,tiled`: choose existing benchmark
  fixtures. `under-glass` moves the lower layer beneath a stationary upper layer.
- `--modes=simplified,full`: select preview modes for a focused diagnostic.
- `--repeat-pointer`: send the same pointer position again every 20 steps to
  investigate Tiled reset jumps; raw `tiled-position` events include pointer,
  local group displacement and normalized document offset.
- `--zooms=fit,100`: compare both preview resolutions.
- `--edge`: extend the horizontal path toward both photo edges (use Fit to
  keep them visible); write this run to a separate output directory.
- `--repetitions=3`: repetitions per scene/zoom/mode.
- `--out=drag-benchmark-results/baseline`: report, raw samples, Chrome trace JSON and
  video directory. Output is ignored by Git and kept outside Playwright’s disposable `test-results`.
  Do not use `test-results` as the output path: other tests clear that directory.

Results identify the OS/CPU/RAM, Chromium, GPU, viewport/DPR, source fixture,
commit and dirty state. Each two-second nominal path contains 120 moves with
60 Hz wall-clock deadlines; actual delivery can fall behind under load. There
is no artificial wait for renderer completion between moves. The final position
is different, then Undo restores the scene before the next repetition.
Each fixture waits for fonts and prepared export before measurement.

The JSON keeps raw events and per-run summaries. `document-update` counts calls
to the workspace document setter, including selection at drag start;
`workspace-commit` counts commits of the workspace component, not every React
component in the application. `preview-request`, `preview-accepted` and
`preview-discarded` distinguish work from results used. `scene-assembly` includes
asynchronous font/image waits and can overlap other work; it is not CPU time.
`scene-draw` times the explicit scene draw. Full render duration includes the
preview composition/copy operation. Scene timings can include export preparation
if it happens during recording. Heap readings exclude much GPU/canvas memory;
they do not establish a cache memory bound.

`rafIntervalsMs` measures animation callback spacing, **not actual presented
frames or input-to-visible-result latency**. Do not mark the PoC's 60 FPS/latency
criteria passed from this number alone. Inspect trace JSON in Chromium's
Performance tooling and correlate with video and raw events. A missing drag
start/end fails the run instead of reporting a falsely fast empty gesture.
Do not compare runs with tracing/video enabled to runs without the same overhead.

These are web Chromium measurements. They are not Electron desktop measurements,
Windows results, or evidence for Linux. Record those environments separately
before accepting the relevant platform criteria. The instrumented renderer can
also be built for desktop using `VITE_DRAG_DIAGNOSTICS=1`; mode selection is via
`?dragPreview=full` or `?dragPreview=simplified` on its renderer URL. The automated
runner currently controls web Chromium only.

When diagnostics are enabled, the browser console exposes
`window.__frameNoteDragDiagnostics.start()` and `.stop()` for manual captures.
Ordinary builds do not install this controller or enable the mode override.

## Retained renderer PoC

`pnpm desktop` and `pnpm dev` select the experimental retained renderer by
default for user review. No URL parameter or environment variable is needed.
Production/release builds keep the accepted simplified drag preview until the
PoC is reviewed and integrated. In a diagnostic production build,
`?dragPreview=poc` selects the prototype. Fields/document updates stay live.
For a local baseline comparison, `?dragPreview=full` and
`?dragPreview=simplified` override the development default.

```sh
node scripts/measure-layer-drag.mjs --headed --scenes=effects,glass-blend,under-glass,tiled --zooms=fit,100 --modes=full,poc --repetitions=3 --compare --check-inputs --repeat-pointer --out=drag-benchmark-results/poc-comparison
```

`--compare` writes reference/actual/diff PNGs and channel-error metrics for each
PoC scene against the export renderer at preview resolution. It does not accept
visual differences automatically. `--check-inputs` reads the position field at
three points while the mouse button is held down and fails if its value stays
frozen. `--repeat-pointer` also exercises the Tiled reset regression.

The PoC caches position-independent content, isolated layer surfaces, Glass
shadows and intermediate canvases. Content and layer bitmap caches retain up to
64 MiB each, scratch canvases up to 64 MiB and Glass shadows up to 32 MiB after a
frame. These limits exclude the current frame's transient allocations, output
buffers, decoded source images, native text nodes and browser/Konva buffers. They are not a bound on
process/GPU memory. Photo/scale/readiness changes dispose the renderer. Preview
output buffers return to their owner only after React stops displaying them.

Ordinary effects reuse their content image. Unaffected layer surfaces are reused;
Glass above a changed layer is invalidated using lower-layer revisions. Output
composition still traverses layers in order and can redraw the entire photo,
particularly for Tiled and dependent Glass. This is not a claim that all scenes
meet the 60 FPS target; inspect the measured slow cases before choosing the next
renderer step.

`--compare-only --compare` records image comparisons without timing gestures.
`--at-edge=top-left` or `--at-edge=bottom-right` selects corner placement for
compare-only checks. Comparisons warm the same retained renderer at another
position first, exercising cache invalidation and lower-layer Glass dependencies.
For clipped native text the compositor retains the reference device origin to
preserve glyph rasterization, then crops the isolated layer surface.
