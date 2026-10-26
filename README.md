<p align="center">
  <img src="docs/assets/framenote-logo.svg" alt="FrameNote" width="360" />
</p>

<h1 align="center">Your photos. Their story.</h1>

<p align="center">
  Turn photo metadata into beautifully styled captions, logos, and reusable layouts.<br />
  Process your photos locally in your browser.
</p>

<p align="center">
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/status-toward%201.0-14CC60?style=for-the-badge" alt="Status: working toward release 1.0" /></a>
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

The project is under active development. The pre-MVP has been completed and
accepted; implemented MVP features and subsequent improvements are documented
below. Product milestones and review status live in the
[product plan](docs/PRODUCT_PLAN.md).

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
- **Consistent styling.** Choose Montserrat or Advercase, Regular or Bold,
  alignment, line spacing, opacity, quick colors, or a custom HEX color. Size
  content in pixels or as a percentage of the short or long image edge.
- **Precise margins.** Adjust four margins independently, in pairs, or together
  through the visual margin editor or interactive photo rulers.
- **Inline logos and artwork.** Set each image height relative to the font or in
  document units. Keep SVG colors or use the layer color; PNG preserves its
  original colors and transparency.
- **Reusable layout presets.** Save layouts locally, update or duplicate them,
  and import/export `.framenote.json` files with their image assets. Built-in
  presets include Default, Default dark, and Macro.
- **Controlled JPG export.** Choose quality from 1–100%, inspect the actual
  encoded file size, and download the prepared result. Preview and export share
  layout calculations.

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

1. Choose a JPG or PNG, or drop it onto the workspace.
2. Edit the default caption, insert metadata from the tag browser, and add images
   through **Content → Add image**.
3. Add layers as needed, then adjust typography, margins, stacking, and position.
4. Save the layout as a preset if you want to reuse it with other photos.
5. Choose JPG quality and select **Export JPG**.

A caption can combine plain text and metadata tokens:

```text
{author}
{lens}
{exposure}
```

Original metadata is also available through namespaced tokens such as
`{exif:Artist}` and `{exif:UserComment}`. The Macro preset uses `{heliconStack}`
for the documented Helicon Focus UserComment format. Missing values are reported
and require confirmation before export for visible layers. Intentional blank
lines are preserved; lines containing only missing values are omitted.

See the [caption tag reference](docs/CAPTION_TAGS.md) for available helpers,
source precedence, formatting, and missing-data behavior.

## Presets and local storage

Presets include layers, content templates, styles, positions, visibility,
stacking order, document units, margins, and used graphics. They exclude the
source photo, resolved metadata values, and JPG quality.

Saved presets persist in the same browser at the same origin. Clearing site data
removes them; export a `.framenote.json` file to back them up or transfer them.
Preset imports are validated and added as new presets without overwriting
existing entries. The format is still evolving during development; compatibility
with older presets is not a stable contract.

Replacing a photo preserves the current layout and export quality in the session.
Refreshing the page resets unsaved editor state; saved presets can be reapplied
after importing a photo.

## Limits and export behavior

| Input        | Limits                                                      |
| ------------ | ----------------------------------------------------------- |
| Source photo | One JPG or PNG; up to 100 MB, 50 MP, and 16,384 px per side |
| Inline SVG   | Up to 256 KB and 2,000 elements                             |
| Inline PNG   | Up to 2 MB, 32 MP, and 16,384 px per side                   |
| Preset file  | Up to 5 MB                                                  |

SVG uploads must be self-contained vector artwork. Scripts, external resources,
embedded images, stylesheets, and text elements are rejected; convert text to
paths before importing. The editor limits active image content to 100 images.

- Export produces `*-framenote.jpg` at the decoded source dimensions, with
  orientation applied to the pixels. JPG is re-encoded, so export is not lossless.
- Source EXIF/IPTC/XMP/GPS metadata and ICC profiles are not copied. Canvas uses
  its default sRGB behavior. Color checks cover the supplied sRGB fixtures;
  Adobe RGB, Display P3, and unusual profiles need separate verification.
- Text does not automatically wrap or shrink to fit. Large layers can extend
  beyond the image, including in Manual mode.
- Metadata availability depends on the file and ExifReader. Not every custom tag
  or MakerNote is supported.
- Large photos may briefly block the main thread. Import limits do not guarantee
  sufficient memory on every device.
- Batch processing, zoom/pan, and a desktop application remain outside the
  current scope.

## Development

The stack combines React, TypeScript, Vite, Tailwind CSS, Konva, Tiptap,
ExifReader, and Radix UI. Unit tests use Vitest; browser tests use Playwright.
Shared components and design tokens are documented in Storybook.

| Command                         | Purpose                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------- |
| `pnpm dev`                      | Start the app on port 3000                                                    |
| `pnpm check`                    | Check formatting, color tokens, lint, types, unit tests, and production build |
| `pnpm test:watch`               | Run unit tests in watch mode                                                  |
| `pnpm test:e2e`                 | Run browser tests in Chromium and WebKit                                      |
| `pnpm test:e2e:ui`              | Open the Playwright test interface                                            |
| `pnpm test:photo-export`        | Run the focused photo export checks                                           |
| `pnpm test:photo-export:review` | Review export checks in Playwright UI                                         |
| `pnpm test:photo-export:report` | Open the saved Playwright report                                              |
| `pnpm storybook`                | Start Storybook on port 6006                                                  |
| `pnpm build-storybook`          | Build the static component documentation                                      |
| `pnpm build`                    | Build the production app                                                      |
| `pnpm preview`                  | Preview the production build                                                  |

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
`pnpm test:e2e:update --project=chromium`. UI-only changes should not require new
export baselines. Automated WebKit tests do not replace manual Safari testing.

### Storybook and design system

Open [localhost:6006](http://localhost:6006) after running `pnpm storybook`.
Stories are grouped into **Design**, **Components** (UI, Layout, Brand), and
**Screens**. `Screens/TestPhotos` exercises the real editor with original photo
fixtures. Application and stories share components and CSS.

UI colors are defined in `src/index.css` and consumed through semantic tokens.
`pnpm check:tokens` checks this convention. The accessibility addon supports
component review; it is not a complete accessibility audit.

Montserrat is bundled through `@fontsource-variable/montserrat`. Advercase files
are stored in `public/fonts/advercase`; the supplied archive did not include a
license file, so its licensing needs review before distribution.

### Repository structure

```text
src/
  components/       Shared UI, layout, and brand components
  domain/           Photo, document, metadata, and preset models
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

- [Changelog: Pre-MVP, MVP, and work toward 1.0](CHANGELOG.md)
- [Product context and milestone plan](docs/PRODUCT_PLAN.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Caption helpers and token syntax](docs/CAPTION_TAGS.md)
- [MVP verification and known limits](docs/MVP_VERIFICATION.md)
- [Photo export visual test plan](docs/EXPORT_VISUAL_TEST_PLAN.md)
- [Inline image refactor](docs/INLINE_LOGO_PLAN.md)
- [Technical remediation and open recommendations](docs/TECHNICAL_REMEDIATION_PLAN.md)
- [Deferred ideas and decisions](docs/NICE_TO_HAVE.md)
- [Original photo fixtures](tests/fixtures/README.md)
