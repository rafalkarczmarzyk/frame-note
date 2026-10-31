<p align="center">
  <img src="docs/assets/framenote-logo.svg" alt="FrameNote" width="360" />
</p>

<h1 align="center">Your photos. Their story.</h1>

<p align="center">
  Turn photo metadata into beautifully styled captions, logos, and reusable layouts.<br />
  Process your photos locally in your browser.
</p>

<p align="center">
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/status-alpha-14CC60?style=for-the-badge" alt="Status: alpha" /></a>
  <img src="https://img.shields.io/badge/photo%20processing-local-00BFB3?style=for-the-badge" alt="Photo processing: local in your browser" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/package-json/v/rafalkarczmarzyk/frame-note?style=for-the-badge&label=FrameNote&color=14CC60" alt="FrameNote package version" />
  <img src="https://img.shields.io/github/package-json/dependency-version/rafalkarczmarzyk/frame-note/react?style=for-the-badge&logo=react&logoColor=white&color=149ECA" alt="React version range" />
  <img src="https://img.shields.io/github/package-json/dependency-version/rafalkarczmarzyk/frame-note/dev/typescript?style=for-the-badge&logo=typescript&logoColor=white&color=3178C6" alt="TypeScript version range" />
  <img src="https://img.shields.io/github/package-json/dependency-version/rafalkarczmarzyk/frame-note/dev/vite?style=for-the-badge&logo=vite&logoColor=white&color=646CFF" alt="Vite version range" />
  <img src="https://img.shields.io/github/package-json/dependency-version/rafalkarczmarzyk/frame-note/tailwindcss?style=for-the-badge&logo=tailwindcss&logoColor=white&color=06B6D4" alt="Tailwind CSS version range" />
  <img src="https://img.shields.io/github/package-json/dependency-version/rafalkarczmarzyk/frame-note/dev/storybook?style=for-the-badge&logo=storybook&logoColor=white&color=FF4785" alt="Storybook version range" />
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#features">Features</a> ·
  <a href="CHANGELOG.md">Changelog</a> ·
  <a href="#development">Development</a> ·
  <a href="#documentation">Documentation</a>
</p>

---

FrameNote is a browser-based photo caption editor built for photographers who
want more control over how metadata appears on their images. Import a photo,
compose a layout with text and graphics, preview your changes, and download a JPG
with the finished design rendered into its pixels. No account or backend is
required for this workflow; photo processing happens in your browser.

The project is currently in **alpha** and under active development. Features
and preset formats may change. The pre-MVP has been completed and accepted;
implemented MVP features and subsequent improvements are documented below.
Product milestones and review status live in the
[product plan](docs/PRODUCT_PLAN.md).

## Versioning

The current numbered version is **0.0.3-alpha**, normalized from the previous
`1.0.0-alpha.1` designation. The first beta targets **0.1.0-beta** after the
[preset and beta requirements](docs/PRESET_VERSIONING_PLAN.md) are met.
**1.0.0** is the first finished stable version, not a version reset.

During beta, compatible fixes increment PATCH (`0.1.0-beta` → `0.1.1-beta`);
features and incompatible changes increment MINOR (`0.1.1-beta` → `0.2.0-beta`),
resetting PATCH. Mixed tasks use the highest required increment. Channel labels
have no extra counter: use `-alpha`, `-beta` and `-rc`. This is our
[SemVer](https://semver.org/) prerelease convention; incompatible changes before
1.0 still require migration and changelog coverage.

About displays the product version, build commit and `dirty` for local changes.
Source archives without Git metadata show `unknown`. To prepare a version, run
`pnpm version:set <version>`, add its changelog section, then run
`pnpm check:version --base=<previous-version-commit>`. The regular `pnpm check`
includes manifest and changelog consistency checks.

An authorized commit or merge of a completed application task into `master`
includes one version increment, dated changelog section and local tag.
Development branch commits do not bump versions. See
[maintain-versioning](.agents/skills/maintain-versioning/SKILL.md).
Historical milestones map pre-MVP to `v0.0.1-alpha` and MVP to `v0.0.2-alpha`;
their target commits are unchanged. Historical manifests are not rewritten.

Betas are source-only: users build the application themselves. No downloadable
builds or installers are published. A local tag does not itself publish anything.

## Features

- **Metadata that becomes part of the image.** Search available EXIF, IPTC, XMP,
  and ICC fields recognized by ExifReader. Combine original tags with readable
  FrameNote helpers such as `{author}`, `{lens}`, and `{exposure}`.
- **A visual caption editor.** Mix text, metadata badges, built-in icons, and
  uploaded SVG or PNG artwork. Insert at the cursor, rearrange inline elements,
  and use undo/redo.
- **Independent layers.** Add, duplicate, delete, reorder, and hide layers.
  Select them from the list or directly on the photo. Hidden layers remain
  editable and are excluded from the preview and export.
- **Flexible positioning.** Use nine anchors within shared margins, or drag a
  layer into Manual positioning with X/Y coordinates relative to the photo.
- **Consistent styling.** Choose from 25 Google Fonts families plus Advercase, supported Bold/Italic variants,
  alignment, line spacing, opacity, quick colors, or a custom HEX color. Size
  content in pixels or as a percentage of the short or long image edge.
- **Layer backgrounds.** Choose None, Color or Glass in the selected layer inspector.
  Control base color and opacity, four-sided padding and corner radius. Color
  backgrounds support a drop shadow with color, opacity, blur, spread and X/Y
  offsets. Glass blurs the photo and visible lower layers beneath raised shading;
  its base color, opacity and blur are independent of content opacity. Background
  settings are included in presets and JPG exports.
- **Precise margins.** Adjust four margins independently, in pairs, or together
  through the visual margin editor or interactive photo rulers.
- **Inline logos and artwork.** Set each image height relative to the font or in
  document units. Keep SVG colors or use the layer color; PNG preserves its
  original colors and transparency.
- **Reusable layout presets.** Save layouts locally, update or duplicate them,
  and import/export `.framenote.json` files with their image assets. Built-in
  presets include Default, Default dark, Signature, Compact EXIF, Camera & Lens,
  Focus Stack, EXIF Icons, Astrophotography, and Long Exposure.
- **Controlled JPG export.** Choose quality from 1–100%, inspect the actual
  encoded file size, choose which supported metadata groups to keep, and download
  the prepared result. Preview and export share layout calculations.

## Quick start

Use the Node.js version in [`.nvmrc`](.nvmrc) and the pnpm version pinned in
[`package.json`](package.json). With nvm installed:

```sh
nvm install
nvm use
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:3000](http://localhost:3000). The development server fails if the
port is occupied instead of silently choosing another one.

Vite and Storybook listen on `0.0.0.0`. To open either from another device on your
local network, use `http://<your-computer-ip>:3000` or
`http://<your-computer-ip>:6006`. The server prints its network addresses at startup.

## Create your first caption

FrameNote opens into an empty editor with a photo-selection button, JPG/PNG drop
guidance and a privacy note in the canvas. The application version, GitHub and
Changelog links sit at the bottom. The FrameNote logo is not a navigation link.

1. Choose one or more JPG/PNG photos, or drop them onto the canvas.
2. Edit the default caption, insert metadata from the tag browser, and add images
   through **Content → Add image**.
3. Add layers as needed, then adjust typography, margins, stacking, and position.
4. Save the layout as a preset if you want to reuse it with other photos.
5. Choose JPG quality and select **Export JPG**, or **Export all** from its menu for a ZIP of the roll.

A caption can combine plain text and metadata tokens:

```text
{author}
{lens}
{exposure}
```

Original metadata is also available through namespaced tokens such as
`{exif:Artist}` and `{exif:UserComment}`. The Focus Stack preset uses `{heliconStack}`
for the documented Helicon Focus UserComment format. Missing values are reported
and require confirmation before export for visible layers. Intentional blank
lines are preserved; lines containing only missing values are omitted.

See the [caption tag reference](docs/CAPTION_TAGS.md) for available helpers,
source precedence, formatting, and missing-data behavior.

`{shutterDuration}` formats long exposures as minutes and hours, for example
`600 s` → `10 min`; `{shutter}` keeps its original seconds format.

## Presets and local storage

Presets include layers, content templates, styles, positions, visibility,
stacking order, document units, margins, and used graphics. They exclude the
source photo, resolved metadata values, and export settings.

Saved presets persist in the same browser at the same origin. Clearing site data
removes them; export a `.framenote.json` file to back them up or transfer them.
Preset imports are validated and added as new presets without overwriting
existing entries. The format is still evolving during development; compatibility
with older presets is not a stable contract.

**Add photos** and canvas drops append photos to the session. A film roll appears
below the canvas when two or more photos are open. Selecting a frame restores
its independent layout, artwork and preset selection. Each added photo starts
with Default; a single first import preserves the layout prepared in the empty
editor. Opening several photos together starts all of them with Default.

**Photo actions → Close photo** closes the active photo and selects a neighbor.
**Dispose roll…** closes all photos after confirmation. Closing the last photo
keeps its layout in the empty editor. Source files and saved presets are not deleted.
Export quality, metadata choices and sidebar state are shared session settings.
Text undo/redo resets when switching photos; edits themselves are retained.
The layout editor and preset management are available before opening a photo.
The first import preserves the prepared layout; document-unit conversions wait
for real image dimensions, and JPG export requires a photo.

Refreshing the page resets unsaved editor state; saved presets can be reapplied
after importing a photo.

Background padding grows around the existing content position: document margins
and Manual coordinates continue to position the text/inline artwork. Enabling a
background does not move content. Backgrounds and shadows can extend into margins
and are clipped at the photo edge. Empty resolved content has no background;
None retains its settings without applying padding. Shadows do not enlarge the
selection area. The layer's padded background does enlarge it.

Glass previews render at screen resolution (up to 1600 pixels on the long edge);
JPGs use full photo resolution. They share composition and material calculations,
with normal rasterization and JPG differences. Full glass remains active while
dragging. Performance with many overlapping glass layers on slower devices still
needs broader measurement.

## Limits and export behavior

| Input        | Limits                                                       |
| ------------ | ------------------------------------------------------------ |
| Source photo | Each JPG or PNG; up to 100 MB, 50 MP, and 16,384 px per side |
| Inline SVG   | Up to 256 KB and 2,000 elements                              |
| Inline PNG   | Up to 2 MB, 32 MP, and 16,384 px per side                    |
| Preset file  | Up to 5 MB                                                   |

SVG uploads must be self-contained vector artwork. Scripts, external resources,
embedded images, stylesheets, and text elements are rejected; convert text to
paths before importing. The editor limits active image content to 100 images.

- Export produces `*-framenote.jpg` at the decoded source dimensions, with
  orientation applied to the pixels. JPG is re-encoded, so export is not lossless.
- **Remove all metadata** is on by default. Turning it off exposes five groups:
  Author & copyright (initially selected), Camera & exposure, Date & time,
  Location, and Descriptions & keywords. Supported fields are written as XMP;
  this is not a byte-for-byte copy of source EXIF/IPTC/XMP. Unrecognized fields,
  thumbnails, editing history, source dimensions and orientation are omitted.
  Choices affect the output file only; metadata remains available for captions.
  Metadata is included in the reported output size. Oversized XMP packets block
  export with an error instead of silently dropping fields.
- Original ICC profiles are not copied. Canvas uses its default sRGB behavior.
  Color checks cover the supplied sRGB fixtures;
  Adobe RGB, Display P3, and unusual profiles need separate verification.
- Text does not automatically wrap or shrink to fit. Large layers can extend
  beyond the image, including in Manual mode.
- Metadata availability depends on the file and ExifReader. Not every custom tag
  or MakerNote is supported.
- Large photos may briefly block the main thread. Import limits do not guarantee
  sufficient memory on every device.
- **Export all** processes photos sequentially and downloads `framenote-roll.zip`.
  Missing metadata/token warnings are confirmed once for the series; failed photos
  are listed and successful outputs remain downloadable. Duplicate output names
  receive numerical suffixes. ZIP output is limited to 1 GB of accumulated entries.
- Import and batch export show progress and can be cancelled. Cancellation waits
  for current decoding/encoding to return and discards pending output. Batch export
  locks editing until it finishes or cancellation completes.
- Only active-preview/import/export photos are fully decoded; inactive photos keep
  small thumbnails and session-owned copies of the encoded source bytes. Switching
  and batch export do not reread the original disk files. These copies last until
  the photos are closed or the page is refreshed and can increase memory/storage
  use for large rolls. Large-series memory budgets still need measurement.
- Zoom/pan remains outside the current scope. A local macOS Apple Silicon desktop
  build is available; see [desktop setup and packaging](docs/DESKTOP.md).

## Development

The stack combines React, TypeScript, Vite, Tailwind CSS, Konva, Tiptap,
ExifReader, and Radix UI. Unit tests use Vitest; browser tests use Playwright.
Shared components and design tokens are documented in Storybook.

| Command                 | Purpose                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------- |
| `pnpm dev`              | Start the app on port 3000                                                         |
| `pnpm check`            | Check formatting, color tokens, lint, types, all test suites, and production build |
| `pnpm test`             | Run unit, E2E, all visual UI projects, and Glass tests; report all failed suites   |
| `pnpm test:unit`        | Run unit tests only                                                                |
| `pnpm test:e2e`         | Run browser tests in Chromium and WebKit                                           |
| `pnpm test:glass-trial` | Build Storybook and run Glass rendering tests in Chromium and WebKit               |
| `pnpm test:e2e:report`  | Open the saved E2E report                                                          |
| `pnpm test:e2e:ui`      | Open the Playwright test interface                                                 |
| `pnpm storybook`        | Start Storybook on port 6006                                                       |
| `pnpm build-storybook`  | Build the static component documentation                                           |
| `pnpm build`            | Build the production app                                                           |
| `pnpm preview`          | Preview the production build                                                       |

Pass options to the main commands instead of using separate shortcuts: `pnpm lint --fix`,
`pnpm test:unit --watch`, `pnpm test:e2e --grep "Photo export"`, or
`pnpm test:e2e:ui --grep "Photo export"`.

Install browser engines before running E2E tests:

```sh
pnpm exec playwright install chromium webkit
pnpm check
pnpm test:e2e
```

Playwright serves the production build on port 4173. Coverage includes photo
import and replacement, metadata, layers, inline graphics, presets, positioning,
and JPG export. Export checks inspect dimensions, encoded size, metadata removal,
sRGB colors, orientation, and rendered pixels.

Visual export baselines are platform-specific. Review actual/expected/diff images
before deliberately updating them with
`pnpm test:e2e --update-snapshots --project=chromium`. UI-only changes should not require new
export baselines. Automated WebKit tests do not replace manual Safari testing.

### Storybook and design system

Open [localhost:6006](http://localhost:6006) after running `pnpm storybook`.
Stories are grouped into **Design**, **Components** (UI, Layout, Brand), and
**Screens**. `Screens/TestPhotos` exercises the real editor with original photo
fixtures. Application and stories share components and CSS.

UI colors are defined in `packages/editor/src/index.css` and consumed through semantic tokens.
`pnpm check:tokens` checks this convention. The accessibility addon supports
component review; it is not a complete accessibility audit.

The caption library offers 25 Google Fonts families plus Advercase, with category
filters and local fonts loaded on demand. See [font delivery and licenses](docs/FONT_LIBRARY.md).
Montserrat is bundled through `@fontsource-variable/montserrat`. Advercase files
are stored in `public/fonts/advercase`; the supplied archive did not include a
license file, so its licensing needs review before distribution.

### Repository structure

```text
apps/web/           Browser entry point
apps/desktop/       Electron main/preload and macOS entry point
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

## Documentation

Some internal product and planning documents are maintained in Polish.

- [Changelog: alpha development and historical milestones](CHANGELOG.md)
- [Product context and milestone plan](docs/PRODUCT_PLAN.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Caption helpers and token syntax](docs/CAPTION_TAGS.md)
- [MVP verification and known limits](docs/MVP_VERIFICATION.md)
- [Photo export visual test plan](docs/EXPORT_VISUAL_TEST_PLAN.md)
- [Inline image refactor](docs/INLINE_LOGO_PLAN.md)
- [Deferred ideas and decisions](docs/NICE_TO_HAVE.md)
- [Original photo fixtures](tests/fixtures/README.md)

### UI visual regression

Compare the current interface against local PNG references (Chromium/macOS):

```sh
pnpm test:visual
pnpm test:visual --grep 'left margin hover'
pnpm test:visual:review
pnpm test:visual:report
```

The runner builds and serves the app on port 4184. Missing references fail without creating new ones. Review changes
before explicitly updating a selected scene:

```sh
pnpm test:visual:update --project chromium-desktop --grep 'left margin hover'
pnpm test:visual --repeat-each=3 --retries=0
pnpm test:visual --all-projects
```

Additional projects: `chromium-compact` and `webkit-desktop`.
References are specific to the project and operating system.
See [the scenario catalog and workflow](docs/UI_VISUAL_REGRESSION_PLAN.md).

### Web and macOS workspace

The project uses a pnpm workspace with `apps/web`, `apps/desktop`,
`packages/editor` and `packages/core`. Web output is `apps/web/dist`; Netlify
build configuration lives in `netlify.toml`. Run `pnpm desktop` to launch macOS
or `pnpm desktop:package` to package a local Apple Silicon application. See
[desktop instructions and limitations](docs/DESKTOP.md).
