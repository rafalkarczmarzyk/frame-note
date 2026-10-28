# Changelog

Notable user-facing changes in FrameNote. The project is currently in alpha.
Pre-MVP and MVP are historical development milestones, not numbered releases.
Development changes accumulate under Unreleased. Version numbers change only
when explicitly requested; a commit does not automatically create a release.

## Unreleased

### Added

- Metadata badges distinguish absent tags in red from recognized fields or helpers
  returning no value in yellow. Compact Empty/Unknown summaries show individual
  field badges below the editor; value tooltips display only the resolved text.
  Content insertion uses a full-width Add row with grouped Metadata, Icons and
  Image actions.

- Multi-photo sessions with independent layouts, artwork and preset selections.
  An SVG film roll appears below the canvas for two or more photos, supports
  horizontal browsing with the mouse wheel and restores each photo's edits.
  The stationary cassette has Emerald, Gold, Ivory and Coral labels with a live
  exposure count. Drag any part of the film to browse or pull beyond its range,
  then release to return; photo clicks remain separate from dragging. The compact
  cassette, translucent dark film, active-frame outline and finely textured graphite
  tray include interactive Storybook previews and reduced-motion support.
  Keyboard focus uses a small marker above frames and the film tail, stays hidden
  during pointer interaction, and skips the decorative tabletop. The lower
  180 px roll reaches the tray edge while browsing, with a softly animated edge
  shade when more film remains and a small gap after the tail. Native pixel-sized
  SVG artwork keeps the current dimensions without scaling legacy geometry; the
  cassette artboard is trimmed to its shell, and film joins no longer use overlaps.
- Export all prepares full-resolution JPGs sequentially and downloads one ZIP,
  with shared quality/metadata settings, collision-safe names, combined token
  warnings, progress, cancellation and per-file failure reporting.
- Reusable translucent glass tooltips throughout typography, colors, margins,
  positioning, layers, inline content, photo/preset actions and export controls.
  Help appears after 750 ms on hover or immediately on keyboard focus, stays
  inside the viewport, explains unavailable actions and dismisses on Escape or
  activation without disrupting editing or dragging. Long labels reveal their
  full text; numeric steppers explain actions and limits. Includes Storybook
  examples and shared help for icon buttons, menus and split buttons.

- Nine built-in layouts, including Signature, Compact EXIF, Camera & Lens,
  Focus Stack (formerly Macro), EXIF Icons, Astrophotography and Long Exposure.
  The new `{shutterDuration}` helper formats long exposures as hours, minutes
  and seconds while preserving the existing shutter and exposure helpers.
- Reusable split button with primary/outline variants, shared sizes and colors,
  independent action states, loading feedback and Storybook examples.
- SVG/PNG drops anywhere in Content insert images at the retained text selection,
  using the same validation and limits as the file picker, with a local drop overlay.
- Canvas-centered glass loading/progress overlay with cancellation and separate
  JPG preparation feedback. Loading preserves canvas and film-roll geometry.

- Shared category filters for fonts, metadata tags and presets, combined with search
  in fixed panel headers without changing existing selections.
- A curated library of 25 Google Fonts families alongside Advercase, with local
  on-demand loading, compact live previews, supported Bold/Italic variants,
  preserved preset identifiers and font readiness before JPG export.
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

- Unified layer selection and editing in one sidebar panel, with a recessed glass
  list, raised active rows, grouped visibility/menu controls and direct removal
  of the selected layer. Visibility buttons reflect their on/off state. Clearer
  Photo info, Units & Margins, Metadata and Export settings labels describe the
  available controls; the layer inspector stays open without a duplicate heading.
  Storybook includes the final shared component and a primary-color comparison.

- Add photos and canvas drops append one or more JPG/PNG files to the session.
  Added photos start with Default; a single first import preserves the prepared
  layout. Close photo selects a neighbor, while Dispose roll closes the series
  after confirmation. Closing the last photo retains its layout in the empty editor.
  Inactive photos keep thumbnails and source files; full decoded photo resources
  are released when switching or closing. Menus with only disabled actions
  support keyboard focus and Escape.
- Compact 48 px header with photo import beside the brand and preset selection,
  split save actions and JPG export on the right. User presets are separated
  from built-ins in the selector; management stays in the searchable docked panel.
- Layout editing and preset management are available before importing a photo.
  A single first import preserves the prepared layout, mounted editor and open
  panels; JPG output and document-unit conversion require actual photo dimensions.
- Slimmed photo rulers to 18 px and reduced preview gutters to 28 px, preserving
  larger handle hit targets and moving interaction labels outside the ruler band.
- Sidebar resizing is limited to 384–560 px. Accordion state and width reset on
  reload; Photo, Sizing & Margins and Export start collapsed.

- Reorganized Typography into sizing, alignment and style, color, and opacity
  rows, with balanced alignment/Bold/Italic controls and full-width glass color
  segments. Quick colors include White, Ivory, Dark gray, Blue charcoal and Black;
  separate rainbow and palette controls indicate how the color was chosen.
- Curated sixteen-color palette in one compact grid and a separate translucent
  floating custom picker with live HEX editing. HEX input stays marked as custom
  even when matching a palette color; existing preset colors remain supported.
- Borderless docked auxiliary sidebars with inset rounded headers and footers,
  preserving opaque surfaces alongside the photo.
- All numeric fields show increase/decrease arrows with field-specific increments:
  0.25 for font size, 0.1 for line spacing and percentage positions, 1 for opacity,
  and unit-appropriate increments for margins and graphics. Keyboard arrows use
  the same steps and limits while manual entry preserves fractional precision.
- Use the custom photo symbol and primary photo-selection button in the empty
  workspace.

- Separate image quality, metadata and output file details in Export, with
  clearly divided rows for metadata groups.
- Open directly in an empty editor with photo selection, JPG/PNG drop guidance,
  a local-processing privacy note, and version, GitHub and changelog links at the
  bottom of the canvas. The header and tools remain visible before import.
- Clicking the logo opens the informational photographic splash with version,
  privacy information and project links, preserving the current editing session.
- Photo imports require a drop on the canvas, with the dark glass overlay confined
  to that area. Header and sidebar reject photo drops; Content separately accepts
  layer images. Reduced-motion and reduced-transparency fallbacks remain available.
- Simplified the layer list with single-line content summaries, persistent
  visibility, position and menu controls, and whole-row dragging. The list uses
  the sidebar's scrolling area and leaves Add layer below the rows.

### Fixed

- Photo import no longer replaces the interface with a text-only loading screen.
  Large photos use a bounded preview bitmap while export retains the original;
  old preview resources are released after their replacement is committed.

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
