# FrameNote user guide

[Back to README](../README.md) · [Desktop setup](DESKTOP.md)

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
- **Consistent styling.** Choose from 25 Google Fonts families, supported Bold/Italic variants,
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

## Create your first caption

FrameNote opens into an empty editor with a photo-selection button, JPG/PNG drop
guidance and a privacy note in the canvas. The application version sits at the bottom; GitHub and Changelog links are in About. On the web, open About using the button beside
the logo (or the logo itself). On desktop, use FrameNote → About FrameNote in
the application menu. About shows the version, project links and an offline
license reader. It does not open automatically at startup.

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

See the [caption tag reference](CAPTION_TAGS.md) for available helpers,
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
existing entries. The supported format is v1, shared by web and desktop. Older
pre-v1 development files are unsupported; future format changes require explicit
migrations. See [preset format](PRESET_FORMATS.md).

Desktop saves presets as individual JSON files in `~/FrameNote/presets` (inside
the user's home directory). Export/import `.framenote.json` files to transfer
layouts between web and desktop; storage is not synchronized. Desktop file names,
conflict handling and external edits are described in [desktop storage](DESKTOP.md#data-and-presets).

**Add photos** and canvas drops append photos to the session. A film roll appears
below the canvas when two or more photos are open. Selecting a frame restores
its independent layout, artwork and preset selection. Every import copies the current layout at the start of the operation into each
new photo, including an import into the empty editor. Later edits are independent.

**Copy settings / Paste settings** in the sidebar or under a film-roll frame copy
the layout, layers and artwork without creating a preset. Copy captures a snapshot;
Paste replaces the target layout and resolves tokens against that photo's metadata.
These actions do not change the active photo or export preferences. The internal
copy lasts until the application closes or reloads; it is not the system clipboard.
Paste requires a copy, and the actions are unavailable while editing is locked.

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

Glass preview and full-resolution JPG may differ slightly through rasterization
and JPG compression. Performance with many overlapping Glass layers on slower
devices has not been broadly measured.

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
- Session copies of source photos remain until closed or the app reloads.
  Large rolls can consume substantial memory/storage; no unlimited-series guarantee.
- Zoom/pan remains outside the current scope. For desktop installation and update notifications, see [desktop setup and packaging](DESKTOP.md).
