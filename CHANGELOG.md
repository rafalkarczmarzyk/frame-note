# Changelog

Notable user-facing changes in FrameNote. The project is currently in alpha.
Pre-MVP and MVP are historical development milestones, not numbered releases.
Development changes accumulate under Unreleased. Version numbers change only
when explicitly requested; a commit does not automatically create a release.

## Unreleased

### Added

- Automatic text alignment following the layer anchor, including Manual position,
  with explicit left, center and right overrides preserved in presets.
- True Montserrat Italic and Bold Italic in preview, JPG export and presets;
  unavailable italic variants are disabled for Advercase.
- Storybook icon catalog documenting Lucide and custom artwork by application,
  including brand assets and both automatic-alignment icons.

- Export metadata controls with removal enabled by default and five optional
  retention groups. Supported source fields are written as XMP and included in
  the prepared download size.
- Reusable glass-style Switch with keyboard support, disabled states and
  Storybook examples for interaction and layout variations.
- Dedicated link preview artwork and metadata for Open Graph and X/Twitter.
- Per-layer menu commands to move up, move down, bring to front, and send to back.

### Changed

- Reorganized Typography into sizing, alignment and style, color, and opacity
  rows, with font icons, grouped Bold/Italic toggles, neutral color swatches and
  direct access to the color panel.
- All numeric fields now show increase/decrease arrows, respecting their steps,
  limits and disabled states, including compact margin fields.
- Use the custom photo symbol and primary photo-selection button in the empty
  workspace.

- Separate image quality, metadata and output file details in Export, with
  clearly divided rows for metadata groups.
- Open directly in an empty editor with photo selection, JPG/PNG drop guidance,
  a local-processing privacy note, and version, GitHub and changelog links at the
  bottom of the canvas. The header and tools remain visible before import.
- The application logo is now passive, preventing accidental navigation and
  loss of the current editing session.
- Restyled the photo drop overlay with dark glass, a thin dashed outline and
  a gentle fade-in, including reduced-motion and reduced-transparency fallbacks.
- Simplified the layer list with single-line content summaries, persistent
  visibility, position and menu controls, and whole-row dragging. The list uses
  the sidebar's scrolling area and leaves Add layer below the rows.

### Fixed

- Warning notices, including overlapping layers, now use yellow instead of
  the green primary-action accent.

## 1.0.0-alpha.1 — 2026-10-26

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
