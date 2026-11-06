# FrameNote 1.0.0 — feature overview

**Draft for the planned first stable release.** This document describes the
current implementation selected for 0.11.0-beta. It does not announce a
published 1.0.0 release or completion of every platform check. The product
version is being prepared as 0.11.0-beta. Outstanding acceptance and release work is tracked
in the [release plan](plans/release-1.0.md).

FrameNote prepares photos for sharing by adding watermarks, author credits,
logos and photographic details. Compose the result visually, reuse the layout
with other photos and export the finished images. Photos are processed on your
device, without an account or an upload service.

## Work in your browser or on desktop

- Use the shared editor in the browser or the Electron desktop application.
- Desktop package targets are macOS Apple Silicon, Windows x64 and Linux x64.
- Desktop editing, bundled fonts and export work offline. Web does not promise
  a first offline launch; desktop release checks require internet access.
- View version/build information, project links and bundled licenses in About.
  Desktop shows About once per product version; web opens it on request.

Installation and platform limitations: [Desktop](DESKTOP.md).

## Import and work with multiple photos

- Add one or more JPG/PNG images through Add photos or drag them onto the canvas.
- Move between open photos using the film roll. Each photo retains its own
  layout, selection, Undo/Redo history and Navigator view for the open session.
- New imports receive the layout current at the start of the import; later
  edits to each photo are independent.
- Copy a snapshot of layout settings and artwork between photos without
  creating a preset. Metadata tokens resolve against the destination photo.
- Close individual photos or dispose of the roll through a confirmation dialog.
  Closing the last photo keeps its layout in the empty editor.
- Prepare a layout before opening a photo. Import and batch export show progress
  and support cancellation; source files remain unchanged.

## Compose text, metadata and artwork

- Combine plain text, metadata tokens, built-in icons, SVG/PNG graphics and
  separators within a layer. Insert content at the cursor and rearrange it inline.
- Browse and search recognized EXIF, IPTC, XMP and other available metadata,
  including field values and their sources.
- Use readable helpers for author, copyright, camera, lens, shutter speed,
  long-exposure duration, aperture, ISO, focal length, capture date/time and
  combined exposure information.
- Include Helicon Focus stack details or a concise frame count when the source
  contains the supported stack comment.
- Format each capture-date token separately using ready-made or validated custom
  patterns, with a live preview. Use a separate capture-time helper or include
  time in a formatted date. Missing dates/times are not replaced by today or midnight.
- Set each graphic's height relative to the font or in document units and align
  it within the line. Keep original SVG colors or use the layer color; PNG keeps
  its original colors and transparency.
- Missing metadata and invalid tokens produce export warnings. Empty metadata
  lines, including their decorative icons, are omitted; literal labels and
  intentional blank lines remain.

Helper sources and formats: [Caption tags](CAPTION_TAGS.md).

## Build and style independent layers

- Add, select, duplicate, reorder, hide and remove layers. Select from the list
  or directly on the photo; hidden layers retain settings and are excluded from export.
- Choose among 25 Google Fonts families plus the DSEG7 Classic segment font.
  Desktop also lists installed system fonts, with App/System source badges.
  Font results are sorted alphabetically and can be searched or filtered.
- Use supported Bold/Italic faces, text alignment, font size, line spacing,
  letter spacing in em, color and content opacity. Unavailable saved fonts
  retain their names and render with Montserrat until replaced.
- Size content in pixels or percentages of the shorter/longer photo edge.
- Use nine anchors within photo margins or Manual positioning with X/Y values
  and direct dragging. Adjust four margins independently, in pairs or together
  using numeric controls, the visual margin editor and photo rulers.
- Repeat an entire layer as a Grid or Staggered watermark. Set the angle,
  spacing and photo-axis offsets, or drag the pattern as one action. Reset its
  offsets without changing angle/spacing. Hover guides stay out of exported images.
- Blend whole layers using Normal, Multiply, Screen, Soft Light or Add, with
  independent layer opacity. Blending includes backgrounds and all Tiled copies.
- Add None, Color or Glass backgrounds, with padding, corner radius, base color
  and opacity. Color backgrounds support a separate shadow; Glass samples and
  blurs the photo and visible lower layers.
- Add ordered Outline, Shadow and Glow effects to the full content, including
  text, metadata, icons, SVG/PNG artwork and separators. Outline stays sharp;
  Shadow/Glow offer offset, spread and blur. Backgrounds remain separate.
- Blur the complete layer content and its decorations, with adjustable radius
  and opacity. Reorder, duplicate, hide and delete effects without losing the
  retained settings of hidden entries.

Font delivery and licenses: [Font library](FONT_LIBRARY.md).

## Navigate and revise your composition

- Use Navigator's overview, Fit, 100%, numeric zoom, zoom buttons and slider,
  up to 800%. Drag the overview or pan with Space/middle-button dragging.
- Scroll to pan; use Cmd/Ctrl + wheel to zoom around the cursor. Z switches
  between recent zoom settings. Gesture delivery depends on browser and hardware.
- Each photo remembers its view during the session. Zoom/pan changes the view,
  without changing layout, export resolution or editing history.
- Undo/Redo content, typography, effects, layers, margins, positioning, preset
  application and pasted settings. Typing and continuous gestures form grouped steps.
- Use keyboard shortcuts, toolbar arrows or the desktop Edit menu. Numeric/color
  drafts support Enter to finish and Escape to cancel.
- History is local to each photo and the current session. Desktop can configure
  the per-photo step limit; a shared memory budget may discard older steps.

## Reuse layouts with presets

- Start from seven built-in presets: **Photo Details** (default), **Signature**,
  **Focus Stack**, **Glass Caption**, **Proof Watermark**, **Quartz Date** and
  **Digital Date**.
- Save your own presets locally, update and rename them, or duplicate a saved
  preset into a draft. Save adds the copy; Cancel leaves the library unchanged.
- An asterisk marks unsaved layout changes. Switching/resetting presets asks
  before discarding them. Deleting a saved preset also requires confirmation and
  preserves the current photo composition.
- Import/export `.framenote.json` files with layers, styles, positions, margins,
  effects and embedded artwork. Source photos and export preferences are excluded.
- Web uses browser storage; desktop uses individual files in `~/FrameNote/presets`.
  Transfer files between platforms; libraries are not synchronized.
- New saves use preset v1. Missing optional capabilities receive safe defaults;
  historical labels 2/3 are read by the current schema. Unknown fields are retained
  while known values remain validated. Older apps may not support new fields/tokens.
- Invalid libraries are reported with recovery information. Preset imports do
  not modify their source files; normal write failures preserve prior data.

Compatibility and recovery: [Preset format](PRESET_FORMATS.md).

## Export finished images

- Export individual JPG or PNG files at the decoded source dimensions, with
  orientation applied. Preview, Navigator and export share the composition renderer.
- Choose JPG quality from 1–100% and inspect the encoded output size. PNG retains
  uncovered source transparency and has no quality slider. JPG uses a white matte.
- Remove metadata (default), or select supported groups: author/copyright,
  camera/exposure, date/time, location and descriptions/keywords. Selected values
  are written as XMP; source metadata remains available to caption tokens.
- Export the open roll sequentially as a ZIP in the selected format. Missing-data
  warnings are confirmed for the series; failed photos are reported while
  successful results remain available. Duplicate output names receive suffixes.
- Save through the browser download flow or the native desktop save dialog.
  Desktop remembers JPG quality and the Remove all metadata preference.

## Desktop preferences and application notices

- Configure Undo limits, window restoration and startup release checking in Settings.
- Restore normal window position, size and maximization when enabled; unavailable
  displays fall back to a visible work area.
- Keep configuration locally in `~/FrameNote/config.json`, reveal it in the file
  manager, or restore preference defaults. Invalid files retain their originals;
  explicit recovery can create a backup. Newer formats cannot be overwritten.
- Check releases automatically or from the application menu. View release opens
  the download page in your browser; replacing the app is manual.
- Application errors, configuration warnings and update notices share a vertical
  stack below the toolbar, with independent actions and dismissal. Open Settings
  shows full configuration diagnostics without interfering with macOS window controls.

## Limits and boundaries

- Source photos: JPG/PNG, up to 100 MB, 50 MP and 16,384 px per side.
  Inline PNG: up to 2 MB/32 MP; inline SVG: 256 KB/2,000 elements;
  presets: 5 MB; Tiled: 2,000 intersecting copies; batch ZIP: 1 GB of entries.
- SVG must be self-contained vector artwork. Scripts, external resources,
  embedded images, stylesheets and SVG text are rejected; convert lettering to paths.
- Text does not automatically wrap or shrink to fit. Styling applies to the
  whole layer, without formatting arbitrary text fragments independently.
- No RAW editing, cropping, photo frames, Lightroom integration, cloud sync or
  saved-session restoration. Unsaved editor state and history end on reload/quit.
- Metadata support depends on the file and ExifReader. Exported metadata is a
  supported selection, not a lossless copy. Source ICC profiles are not copied;
  Canvas uses its default sRGB behavior.
- Large photos, dense Glass/Tiled compositions and effects can pause the main
  thread or reach local memory/render-buffer limits. Input limits do not guarantee
  available memory on every device. Web/desktop share rendering, but platform,
  font availability and image encoding can affect the final raster.
- macOS automated checks do not establish complete Windows/Linux manual acceptance.
  Current platform checks and remaining items are recorded in the release plan.

Full usage and limits: [User guide](USER_GUIDE.md). Changes selected for this beta:
[0.11.0-beta](../CHANGELOG.md#0110-beta---2026-11-06).

## Licensing

FrameNote's original software is GPL-3.0-or-later. Bundled fonts and dependencies
retain their own licenses; sample photographs have separate noncommercial terms
and some artwork is excluded from the software license. These terms do not apply
to your own photos or exported images. See [Licensing](../LICENSING.md) and
[source distribution](SOURCE_DISTRIBUTION.md).
