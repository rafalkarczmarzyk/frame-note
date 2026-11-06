# Preset format

New presets and exports use **`version: 1`**. One current
[Zod schema](../packages/core/src/preset-schema.ts) validates every preset;
[parsePreset](../packages/core/src/presets.ts) then normalizes missing optional
capabilities. The schema number is independent of the application version.
Historical development labels 2 and 3 are accepted by this same schema and
normalized to 1 on read. No separate version schemas, migrations or file
converter are maintained. Pre-v1 development JSON remains unsupported.

## Optional capabilities and defaults

Missing `blending` becomes `{ "mode": "normal", "opacity": 1 }`.
Missing `position.tiled` becomes a disabled Staggered pattern at 30°, spacing 12%,
and zero offsets. Existing style opacity, artwork, positioning and retained
Tiled/Blending values are preserved. New saves include both capabilities.
Defaults apply only when a capability is absent: incomplete objects, unknown
blend modes and invalid known values are rejected with a field path. Additional
fields are accepted at every object level, ignored by the editor and retained
through ordinary reads and saves, including root metadata and embedded assets.
Current readers tolerate additional fields; historical readers may still reject
them. A shared version number does not guarantee support for every new value
of an existing field (for example a new blend mode).

`blending.mode` is `normal`, `multiply`, `screen`, `soft-light` or `add`;
`blending.opacity` is 0–1. Blending affects the entire composed layer,
including every Tiled copy, against the photo and visible layers below.

`position.tiled` contains `enabled`, `pattern` (`grid` or `staggered`),
`angle` (−180 to 180 degrees), `spacing` (0–100% of the shorter photo side),
and `offset: { x, y }` (−100–100% of that side in photo axes).
Disabled settings are retained independently of Anchor/Manual positioning.
Sizing-unit changes do not alter these normalized pattern values.

`style.letterSpacing` is optional tracking in em, from -0.1 to 1. Missing means
zero; document unit conversion leaves this relative value unchanged.

### Text and content effects

An optional top-first `effects` array belongs to each layer. Missing effects
normalize to `[]`. Each entry has a unique layer-local `id`, `type` (`outline`,
`shadow`, `glow`, `blur`), `enabled`, `color`, `opacity` (0–1), and document-unit
`x`, `y`, `spread`, `blur`. Blur and Outline thickness cannot be negative;
Shadow/Glow spread can. At most 100 effects per layer are accepted. Known fields
are validated and unknown fields retained through editing and saving.

Outline/Shadow/Glow draw independent copies of the original content alpha mask
below text, icons, SVG/PNG graphics and separators. Backgrounds are excluded.
Outline ignores stored `x`, `y` and `blur`: it always uses zero offset and blur.
These legacy fields remain readable and retained without a file migration.
Blur uses only its blur radius and opacity, softening the complete content after
text decorations, without the background. Multiple Blur entries run back to front.
Current older readers retain additive fields but do not render these effects.
The format remains v1 and the library key is unchanged.

## Reading and saving

Import does not modify its source file. Reading a saved library normalizes it
in memory; later saves write the current v1 shape through the ordinary storage
path. There are no version-specific backup directories or storage keys.
Existing recovery/backup files are not deleted. The browser key remains
`framenote.presets.v1`; desktop files remain in `~/FrameNote/presets`.
Validation still covers artwork, colors, unique identifiers and the 5 MB limit.
Normal write failures preserve prior data; see recovery below.

## Example preset

This minimal v1 JSON represents one visible caption layer anchored at the
bottom right. Save it as `photo-details.framenote.json` and import it through
the preset controls. This is an example document, not a JSON Schema definition;
the authoritative validation schema is [presetSchema](../packages/core/src/preset-schema.ts).

```json
{
  "version": 1,
  "id": "photo-details",
  "name": "Photo details",
  "layout": {
    "sizingUnit": "short-edge",
    "margins": {
      "top": 3,
      "right": 3,
      "bottom": 3,
      "left": 3
    },
    "marginLinkMode": "all",
    "activeId": "caption-1",
    "containers": [
      {
        "id": "caption-1",
        "template": "{author}\n{lens} · {exposure}",
        "style": {
          "fontFamily": "Montserrat Variable",
          "fontWeight": 400,
          "fontStyle": "normal",
          "fontSize": 2,
          "color": "#FFFFFF",
          "opacity": 1,
          "lineHeight": 1.2,
          "textAlign": "right"
        },
        "position": {
          "anchor": "bottom-right"
        },
        "visible": true
      }
    ]
  },
  "icons": []
}
```

- `version` identifies the preset format, independently of the application version.
- `id` and `name` identify the preset; container IDs must be unique within the layout.
- `sizingUnit: "short-edge"` expresses lengths as percentages of the photo's
  shorter edge: here the font size is 2% and each margin is 3%. Other units are
  `"px"` and `"long-edge"` (percent of the longer edge).
- `activeId` identifies the selected layer. `containers` stores the ordered layers,
  including their templates, typography, position and visibility.
- `template` combines text with [metadata tokens](CAPTION_TAGS.md); `\n` adds a
  line break. Metadata is resolved from the current photo, not saved in the preset.
- `icons` is required even when empty. This example contains no embedded artwork.
  Layers can additionally contain optional `images` and `background` objects;
  optional fields are omitted here to keep the example small.

Presets do not include the source photo or export settings. Imports also pass
[parsePreset](../packages/core/src/presets.ts), which validates colors, identifiers,
embedded artwork and the 5 MB size limit in addition to the Zod structure.

## Font-name compatibility

Nonempty font family names are retained. An unavailable family renders with
Montserrat until explicitly replaced; font files and system paths are not
embedded. Earlier readers with a fixed family list may reject unknown names.

## Schema evolution

Additive optional fields stay in v1 and receive safe defaults after validation.
Test omitted fields, preserved supplied values and unknown fields, invalid known
data, and save/read round trips. Change the format number only when structure or meaning changes
in a way that requires actual conversion. Decide compatibility and data
protection for that concrete change, rather than adding a migration chain for
every new option.

## Stored libraries and recovery

The web library validates each saved entry independently. Valid supported presets remain
available when another entry cannot be read; saves and imports preserve unreadable
entries alongside the valid presets. The preset panel lists the rejected entry's
name or position and the reason, including schema field paths where available.
The recovery download contains the original library loaded at startup.

Malformed JSON or a non-array library blocks overwriting the whole collection.
Desktop file libraries retain their existing stricter behavior: an unreadable file
blocks loading and saving until resolved, leaving the original files untouched.
Recovery does not convert unsupported development formats into a supported preset format.
