<p align="center">
  <img src="packages/editor/src/assets/graphics/framenote-app-icon.png" alt="FrameNote app icon" width="160" height="160" />
</p>

<h1 align="center">FrameNote</h1>
<h2 align="center">Leave your mark.</h2>

<p align="center">
  Add a watermark, logo, or photo details.<br />
  Photos stay on your device — in your browser or the desktop app.
</p>

<p align="center">
  <a href="CHANGELOG.md"><img src="https://img.shields.io/github/package-json/v/rafalkarczmarzyk/frame-note?style=plastic&label=version&color=14CC60" alt="FrameNote version" /></a>
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="docs/USER_GUIDE.md">User guide</a> ·
  <a href="docs/DEVELOPMENT.md">Development</a> ·
  <a href="CHANGELOG.md">Changelog</a>
</p>

---

FrameNote adds watermarks, logos and photo metadata to your images. Compose
layers with text and graphics, save reusable presets, and export JPGs individually
or as a ZIP. Processing stays on your device; no account or backend is required.

**Beta:** the web editor and local macOS Apple Silicon app are available from
source. Tagged builds are configured to prepare macOS, Windows and Linux packages
in GitHub Releases; availability depends on a successful build and publication.
See [desktop setup and release limitations](docs/DESKTOP.md).

## Features

- EXIF/IPTC/XMP metadata tokens mixed with text, SVG/PNG graphics and icons.
- Independent layers, positioning, margins, color and Glass backgrounds.
- Bundled fonts plus installed system fonts in the desktop app.
- Local presets with shared v1 JSON import/export across web and desktop.
- JPG quality and metadata controls, with batch export to ZIP.

## Quick start

Use Node.js from [`.nvmrc`](.nvmrc) and pnpm pinned in
[`package.json`](package.json). With nvm installed:

```sh
nvm install
nvm use
corepack enable
pnpm install --frozen-lockfile
pnpm run dev
```

Open [localhost:3000](http://localhost:3000).

For desktop development, run `pnpm run desktop`. To build and install on your
Apple Silicon Mac:

```sh
pnpm run desktop:install
```

Quit FrameNote first. The command installs into `/Applications`; use
`pnpm run desktop:install --user` for `~/Applications`, or add `--open` to launch
after installation. See [desktop requirements](docs/DESKTOP.md#build-and-install-with-one-command).

## Development

| Command                    | Purpose                                              |
| -------------------------- | ---------------------------------------------------- |
| `pnpm run dev`             | Run web locally                                      |
| `pnpm run desktop`         | Build and launch desktop locally                     |
| `pnpm run desktop:install` | Build and install locally on macOS Apple Silicon     |
| `pnpm run build`           | Build web for production                             |
| `pnpm run storybook`       | Browse shared UI components                          |
| `pnpm run check`           | Check code, run web/unit/visual suites and build web |

Native desktop tests run separately. All commands, prerequisites, packaging and
release instructions are in the [development guide](docs/DEVELOPMENT.md).

## Documentation

- [User guide: editing, presets, export and limits](docs/USER_GUIDE.md)
- [Desktop: installation, storage, packaging and GitHub Releases](docs/DESKTOP.md)
- [Development: commands, tests, workspace and versioning](docs/DEVELOPMENT.md)
- [Caption metadata tokens](docs/CAPTION_TAGS.md)
- [Preset format v1](docs/PRESET_FORMATS.md)
- [Fonts and licenses](docs/FONT_LIBRARY.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Product plan](docs/PRODUCT_PLAN.md) · [Deferred ideas](docs/NICE_TO_HAVE.md)
- [Changelog](CHANGELOG.md)

Some internal planning documents are maintained in Polish.
