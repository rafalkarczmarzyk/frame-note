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
  Tiled repeats the whole layer as Grid or Staggered (alternate rows shifted by
  half a step). New patterns default to Staggered, 30°, 12% spacing and zero
  offsets. Angle rotates the grid and its motifs together; spacing and
  offsets use percentages of the shorter photo side, independently of document
  sizing units. Positive offsets move right/down at every angle. With zero
  offsets, a motif is centered. Drag any copy to move the pattern as one Undo
  action; gaps let you select lower layers. Hovering any copy outlines the whole
  pattern; hovering its layer-list entry does the same. The origin motif has a
  green outline during these hovers or while hovering the Offset X/Y fields.
  Selection alone does not display outlines. These guides appear only in the editor.
  Reset offset leaves angle and spacing intact.
  Switching back restores the retained single-mark coordinates. Backgrounds are
  repeated per copy, with Glass sampling the photo and lower layers at each copy.
  Patterns above 2000 intersecting copies require more spacing or a larger motif;
  the app reports the limit and blocks export rather than dropping copies.
- **Consistent styling.** Choose from 25 Google Fonts families and DSEG7 Classic, supported Bold/Italic variants,
  alignment, line and letter spacing, opacity, quick colors, or a custom HEX color. Size
  content in pixels or as a percentage of the short or long image edge.
- **Layer backgrounds.** Choose None, Color or Glass in the selected layer inspector.
  Control base color and opacity, four-sided padding and corner radius. Color
  backgrounds support a drop shadow with color, opacity, blur, spread and X/Y
  offsets. Glass blurs the photo and visible lower layers beneath raised shading;
  its base color, opacity and blur are independent of content opacity. Background
  settings are included in presets and JPG/PNG exports.
- **Precise margins.** Adjust four margins independently, in pairs, or together
  through the visual margin editor or interactive photo rulers.
- **Inline logos and artwork.** Set each image height relative to the font or in
  document units. Keep SVG colors or use the layer color; PNG preserves its
  original colors and transparency.
- **Reusable layout presets.** Save layouts locally, update or duplicate them,
  and import/export `.framenote.json` files with their image assets. Built-in
  presets are Photo Details, Signature, Focus Stack, Glass Caption,
  Proof Watermark, Quartz Date and Digital Date.
- **JPG and PNG export.** Choose JPG quality from 1–100%, inspect the actual
  encoded file size, choose which supported metadata groups to keep, and download
  the prepared result. Preview and export share layout calculations.

## Navigating the photo

Navigator sits at the top of the tools sidebar. Its overview includes the photo
and visible layers; the outline marks the part currently visible in the editor.
Drag inside the outline to move it, or click elsewhere in the overview to center
on that point. Empty space around the overview does nothing.

- **Fit** shows the whole composition without enlarging small photos.
- **100%** maps one image pixel to one CSS pixel, including on Retina displays.
- The percentage field shows the current zoom and accepts a typed value. Its
  arrows change zoom by one percentage point. Fit and 100% highlight their
  active states; these controls share one input group.
- Manual changes from the slider, percentage field or scrolling round to whole
  percentages. Fit keeps its exact fractional scale. Tiny wheel/pinch deltas
  accumulate until the next whole percentage instead of being discarded.
- The slider uses a logarithmic scale. The zoom buttons step through fixed levels,
  up to 800%. The manual minimum rounds the smaller of Fit/25% up to a whole
  percentage; Fit can sit just below that manual minimum.
- **Z** switches between the last two zoom settings. Consecutive numeric-field, slider, wheel
  and zoom-button changes form one action, even with pauses. Panning, choosing a
  preset, using another tool or leaving the window ends that action.
- Hold **Space** and drag with the left mouse button, or drag with the middle
  mouse button, to pan. Press Escape during a pan to restore its starting point.
- Scroll or use two fingers to pan. Shift with vertical scrolling pans
  horizontally. **Cmd + wheel** on macOS and **Ctrl + wheel** on Windows/Linux
  zoom around the cursor; browsers also supply trackpad pinch as Ctrl + wheel.
  Gesture delivery depends on the browser and device.

Rulers follow the top and left photo edges, then stay at the viewport boundary
when those edges move out of view. Offscreen margin handles remain offscreen;
use the sidebar fields to adjust them. Navigation shortcuts leave text fields,
open menus and dialogs to their normal keyboard handling.

Each open photo remembers its own zoom, pan and recent zoom settings for this
session. The panel's collapsed state is shared. Closing the
session discards view settings. Navigation does not change layers, Undo/Redo,
presets or exported JPGs.

## Create your first caption

FrameNote opens into an empty editor with its logo and a JPG/PNG drop hint;
use **Add photos** in the toolbar or drop files onto the canvas. The application
version sits at the bottom; GitHub and Changelog links are in About. On the web,
open About using the button beside the logo or the logo itself. On desktop,
use **FrameNote → About FrameNote**. About shows version/build information,
project links and an offline license reader. Desktop shows it once on the first
launch of each product version; web opens it only when requested.

1. Choose one or more JPG/PNG photos, or drop them onto the canvas.
2. Edit the default caption, insert metadata from the tag browser, and add images
   through **Content → Add → Graphics**.
3. Add layers as needed, then adjust typography, margins, stacking, and position.
4. Save the layout as a preset if you want to reuse it with other photos.
5. Choose JPG or PNG in **Export settings**, then select **Export JPG** or **Export PNG**. JPG quality is retained when switching formats. **Export all** creates a ZIP of the roll in the selected format.

A caption can combine plain text and metadata tokens:

```text
{author}
{lens}
{exposure}
```

Original metadata is also available through namespaced tokens such as
`{exif:Artist}` and `{exif:UserComment}`. The Focus Stack preset uses `{heliconStackSummary}`
for a concise count from the documented Helicon Focus UserComment format;
`{heliconStack}` remains available for the full details. Missing values are reported
and require confirmation before export for visible layers. Intentional blank
lines are preserved; lines containing only missing values are omitted.

See the [caption tag reference](CAPTION_TAGS.md) for available helpers,
source precedence, formatting, and missing-data behavior.

`{shutterDuration}` formats long exposures as minutes and hours, for example
`600 s` → `10 min`; `{shutter}` keeps its original seconds format.

## Layer blending

The selected layer's **Blending** section sits after Typography; Effects follows Blending.
Choose Normal, Multiply, Screen, Soft Light or Add from the **Blend mode**
dropdown. The selected mode is shown by its full name. **Layer opacity** affects the
whole layer, including text, artwork, Color/Glass backgrounds and every Tiled
copy. Typography opacity still controls text/artwork within the layer.

New layers start at Normal and 100%. At 0% the layer is invisible; its settings
remain editable. Glass samples the composition below the layer. Hover outlines
and other editor decorations are excluded from blending, Navigator and export.
Blending uses the original photo alpha; JPG adds its white matte after blending,
while PNG retains transparency. The shared renderer provides the preview, Navigator
and JPG/PNG/ZIP output; effect preview resolution follows zoom and display density up to the original photo resolution. At 100% it uses the original image and full-resolution effects. Fit uses a smaller composition; zoom above 100% magnifies the exported pixels. Dense Tiled Glass can take longer to render.

Presets save as v1 with blending settings. Missing blending settings receive
Normal and 100% layer opacity. Historical labels 2/3 are also readable; older
applications may reject fields they do not understand. See [Preset format](PRESET_FORMATS.md).

Typography also provides **Letter spacing** in em (relative to font size), with
a 0.01 step and a default of 0. Negative values tighten the text.

## Layer effects

Use **Effects → Add effect** in the selected layer inspector. Outline, Shadow and
Glow decorate the complete content: text and resolved metadata, icons, SVG/PNG
graphics and separators. Each uses the same original alpha mask, so transparent
PNG areas are respected. The background and its shadow stay separate. Outline thickness is
nonnegative; Shadow and Glow allow negative spread. Outline exposes thickness, color and opacity and always stays sharp and centered.
Shadow and Glow also expose offset and blur.

**Blur** softens the entire layer content, including icons, graphics and text
effects. The background and its shadow stay separate. Blur opacity mixes the
sharp and softened content; multiple Blur entries run from the bottom upwards.

Drag rows or use their action menus to reorder, duplicate or delete effects.
The eye hides an effect while preserving its settings. Color controls use the
same quick colors, palette sidebar and custom HEX picker as Typography.
Spread/thickness and blur step by 0.02 in percentage units or 0.1 px; manual
values can be more precise. Effects use the document unit and do not move anchors
or change Tiled spacing. They are included in Navigator, presets and export.
Very large effects can exceed the local render buffer limit and require a smaller
radius or content size.

## Undo and Redo

Use the header arrows or the desktop **Edit → Undo / Redo** menu. On macOS,
press **Cmd+Z** or **Cmd+Shift+Z**; on Windows/Linux, use **Ctrl+Z**,
**Ctrl+Shift+Z**, or **Ctrl+Y** for Redo. Search and preset-name fields retain
normal text editing; caption content and layout controls share the photo history.

History covers content, tags, artwork, styles, layers, visibility, order,
position, margins, preset application and Paste settings. Typing stays one step
until you leave the editor or start another operation; adding/removing a tag or
image makes a separate step. A continuous drag or slider gesture is one step.
Numeric/HEX edits finish on Enter or leaving the field; Escape cancels the edit.
Undo while typing finishes and undoes the whole group. A new edit after Undo
clears Redo; simply selecting layers does not create a step.

History belongs to each photo and survives frame switching during the session.
New imports start with empty histories; closing a photo discards its history.
The empty workspace has its own history, reset when the last photo closes.
History is not saved in presets or exported files and disappears on reload/quit.
Saving/deleting presets, importing/closing photos, export and view navigation
are outside Undo/Redo.

By default, each document keeps up to 100 steps, with a shared 64 MiB estimated
history budget. Older steps may be discarded; the Undo tooltip indicates this.
Artwork required by remaining steps, current documents and copied settings stays
available. These limits estimate stored history, not the application's total RAM.
Desktop **Settings…** can change the per-photo limit to 1–1000. Saving a lower
limit immediately trims existing histories; raising it does not restore removed
steps. Web keeps the default limit.

## Presets and local storage

Presets include layers, content templates, styles, positions, visibility,
stacking order, document units, margins, and used graphics. They exclude the
source photo, resolved metadata values, and export settings.

Saved presets persist in the same browser at the same origin. Clearing site data
removes them; export a `.framenote.json` file to back them up or transfer them.
Preset imports are validated and added as new presets without overwriting
existing entries. New presets use v1, shared by web and desktop. Missing optional
settings receive safe defaults; historical labels 2/3 use the same reader. Earlier
applications may reject newer fields. Pre-v1 development files remain unsupported.
See [preset format](PRESET_FORMATS.md).

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
**Dispose roll…** closes all photos after confirmation in the shared app dialog;
Cancel or Escape keeps the roll and edits. Closing the last photo
keeps its layout in the empty editor. Source files and saved presets are not deleted.
Export settings and sidebar state are shared across the photo session. Desktop
also remembers JPG quality and the Remove all metadata choice between launches;
individual metadata groups remain session-only.
Each photo retains its own Undo/Redo history when switching frames.
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

A `*` after the selected preset name means the layout has unsaved changes.
Save the preset or use **Save as new** to keep them. Switching presets (including
applying an imported preset) asks before discarding changes. **Cancel** keeps
the current layout. **Reset to saved** in Preset actions restores the selected
preset after confirmation, including built-in presets. Selection of a layer alone
does not mark a preset as changed; undoing all edits clears the asterisk.

In **Manage presets**, **Duplicate** opens a draft name form. **Save** adds a copy
of the saved source preset; **Cancel** discards the draft. Duplicating does not
change the current photo layout or preset selection. Creating and renaming use a
separate framed form with a full-width name field. Deleting a saved preset asks
for confirmation; Cancel or Escape keeps it. Deletion leaves the current photo
layout intact and selects Photo Details when the deleted preset was active.

## Application notifications

Errors and desktop configuration/update notices appear in a shared stack at the
top of the workspace, below the toolbar. Simultaneous notices remain one below
another; each dismissible notice closes independently. Long messages wrap and
the stack scrolls when needed. Configuration warnings offer **Open Settings**
for full diagnostics and recovery; dismissing the notice leaves those details
available in Settings. **View release** opens an available desktop release in
the system browser. Web does not check for desktop releases.

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

- Individual export produces `*-framenote.jpg` or `*-framenote.png` at the decoded source dimensions. The format choice lasts for the current editor session; PNG preserves uncovered source transparency and has no quality slider. Orientation is applied to the pixels. JPG is re-encoded, so export is not lossless.
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
- **Export all** processes photos sequentially in the format selected when export starts and downloads `framenote-roll.zip`.
  Missing metadata/token warnings are confirmed once for the series; failed photos
  are listed and successful outputs remain downloadable. Duplicate output names
  receive numerical suffixes. ZIP output is limited to 1 GB of accumulated entries.
- Import and batch export show progress and can be cancelled. Cancellation waits
  for current decoding/encoding to return and discards pending output. Batch export
  locks editing until it finishes or cancellation completes.
- Session copies of source photos remain until closed or the app reloads.
  Large rolls can consume substantial memory/storage; no unlimited-series guarantee.
- For desktop installation and update notifications, see [desktop setup and packaging](DESKTOP.md).

## Built-in starting presets

Photo Details is the default: author, lens and exposure icons. Signature uses an
italic serif author credit. Focus Stack adds a second corner with a concise Helicon
stack count. Glass Caption demonstrates a glass background; Proof Watermark repeats
a translucent proof mark; Quartz Date stamps a short capture date in
orange italic segment digits with Add blending, a warm glow and subtle blur; Digital Date uses regular Oswald, a black 80% outline (0.06% of the shorter edge) and Normal blending. Missing metadata follows the normal export warning flow.
Quartz Date does not substitute today's date. Saved custom presets remain independent
of built-in updates.

Select a date token in Content to choose its Date format. Custom patterns accept
YYYY/YY (year), MM/M (month), DD/D (day), HH:mm (24-hour capture time), spaces, dots, slashes, hyphens, underscores
and apostrophes. Include each date part once. Apply format or Enter saves a valid
pattern; invalid drafts do not change the photo. The preview uses the photo date,
or a clearly labeled example when missing. Formats are independent for each token.

Digital Date defaults to YYYY/MM/DD in golden orange. Select its date token and choose
YYYY/MM/DD HH:mm for the version with capture time. Time comes from EXIF/XMP
DateTimeOriginal with no timezone conversion; absent times are never replaced by midnight.
