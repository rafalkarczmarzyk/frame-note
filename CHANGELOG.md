# Changelog

Notable user-facing changes in FrameNote. Pre-MVP and MVP are development
milestones, not numbered releases. Current work is collected under Unreleased
until the first 1.0 release.

## Unreleased — toward 1.0

### Added

- PNG source photo import alongside JPG.
- Inline SVG and PNG images alongside text, metadata, and icons, with independent
  image sizing relative to the font or in document units.
- Original-color or layer-color rendering for SVG images, and transparency
  support for PNG images.
- Interactive photo rulers with linked margin handles, keyboard adjustment,
  and drag cancellation.
- Layer visibility and drag-and-drop stacking order, including keyboard controls
  and scrolling while reordering long lists.
- Expanded photo export regression checks across browsers, photo fixtures,
  presets, and image geometry.

### Changed

- Unified text and image composition through **Content → Add image**, replacing
  the separate logo creation workflow.
- Renamed composition blocks to **Layers** throughout the interface.
- Simplified the selected-layer inspector and combined sizing and margins in
  one sidebar section with a compact margin editor.
- Extended preset storage to include inline image assets, layer ordering, and
  visibility. Preset compatibility remains subject to change before 1.0.
- Reworked the README in English with project branding, version badges, and
  current setup and feature documentation.

### Fixed

- Improved photographic ISO and APEX exposure resolution, XMP namespace
  provenance, and validation of caption text and capture dates.
- Preserved the prepared JPG when changing the selected layer.
- Improved image decoding validation and handling of asynchronous image edits.
- Enforced the active image limit when pasting plain-text image tokens.
- Improved keyboard focus entry and return in floating panels.
- Restored the Canon photographic sensitivity metadata helper.

## MVP

### Added

- Multiple independently styled caption containers, selected from a list or
  directly on the photo, with add, duplicate, and delete actions.
- Manual positioning by dragging or entering photo-relative X/Y coordinates,
  alongside the nine-anchor layout.
- A visual Tiptap editor with metadata badges, inline SVG icons, undo/redo,
  and token-based clipboard handling.
- Custom SVG icon uploads and standalone SVG logos with proportional sizing,
  opacity, and original or single-color rendering.
- Named layout presets saved in the browser, with update, duplicate, rename,
  delete, and JSON import/export including SVG assets.
- Default, Default dark, and Macro presets, including a helper for the documented
  Helicon Focus UserComment format.
- Verification of presets after reload, landscape and portrait layouts,
  missing-data handling, and JPG rendering in Chromium and WebKit.

### Fixed

- Preserved intentional blank caption lines while omitting lines emptied by
  missing metadata or icons.
- Treated empty metadata values as missing.
- Allowed preset identifiers to be generated when using the app over HTTP on
  a local network.

## Pre-MVP

### Added

- The initial local photo-to-caption workflow: import, metadata extraction,
  live preview, styling, and JPG export.
- Searchable metadata tokens and readable FrameNote helpers such as `{author}`,
  `{lens}`, and `{exposure}`, with missing-field warnings.
- Multiline captions with Montserrat and Advercase, Regular/Bold, color,
  opacity, alignment, and line spacing.
- Nine-anchor positioning, shared margins, and sizing in pixels or percentages
  of the short or long photo edge.
- JPG quality controls, actual encoded output size, and full-resolution export
  using shared preview and export geometry.
- Import limits, replacement-photo state retention, original photo fixtures,
  and automated export checks.
- A shared dark UI and design system documented in Storybook.

For current capabilities and limits, see the [README](README.md). Historical
implementation details and milestone reviews live in the
[product plan](docs/PRODUCT_PLAN.md).
