# Preset formats

New presets and exports use **v2**. The app reads official v1 and v2 files;
v1 is migrated in memory without changing its layout, IDs or artwork. Older
FrameNote versions reject v2 files. Pre-v1 development JSON remains unsupported.
The format version is independent of the product version.

The frozen schemas are [v1](../packages/core/src/preset-formats/v1.ts) and
[v2](../packages/core/src/preset-formats/v2.ts); the v2 module also defines the
shared v1 → v2 migration. Both paths validate embedded SVG/PNG data, colors,
unique identifiers and the 5 MB limit. Unknown fields and future versions are
rejected rather than silently discarded.

## Tiled position in v2

A container may include `position.tiled`:

```json
{
  "enabled": true,
  "pattern": "staggered",
  "angle": -30,
  "spacing": 12,
  "offset": { "x": 0, "y": 0 }
}
```

Angle is in degrees (−180 to 180, editor step 0.1). Spacing is 0–100% of the
shorter photo side; offsets are −100–100% of that side, always in photo axes.
`enabled: false` retains the pattern settings while Anchor/Manual is active.
`position.anchor` and optional `position.custom` remain independent, preserving
the single-mark position while the pattern is enabled. Global sizing-unit
changes do not alter these normalized pattern settings. The v1 migration adds
no tiled settings, preserving its original positioning.

## Conversion and original data

Importing a file does not modify the source. To convert files separately:

```sh
node scripts/convert-preset.mjs path/to/preset.json
```

The converter uses the application's parser and migration, validates artwork,
and writes `preset.v2.json` next to the source. It never overwrites the source
or an existing destination. No downgrade converter is provided.

Desktop preserves a v1 file in `presets/v1-originals` before its first saved
replacement as v2. Browser storage retains the original v1 collection under
`framenote.presets.v1.original` before the first migrated write; the active
storage key remains `framenote.presets.v1`. A failed backup prevents replacement.

## Example preset

This complete v1 JSON represents one visible caption layer anchored at the
bottom right. Save it as `photo-details.framenote.json` and import it through
the preset controls. This is an example document, not a JSON Schema definition;
the authoritative validation schema is [presetV1](../packages/core/src/preset-formats/v1.ts),
with field definitions in [fields.ts](../packages/core/src/preset-formats/fields.ts).

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

By explicit product decision, v1 accepts arbitrary nonempty font family names.
Earlier v1 readers with a fixed family list may reject them. An unavailable family
retains its saved name and renders with Montserrat until explicitly replaced;
font files and system paths are not embedded. This exception does not authorize
other schema changes without a new format version.

## Future format changes

From now on, every new format version requires:

- Its own frozen Zod schema and parser; do not change v1 to accept a new format.
- An explicit sequential migration from the previous supported version.
- A file conversion script using the same migration code as the application.
- Tests with fixtures from each supported format, including full-chain migration.
- Preservation of originals before persistent conversion, with clear errors for
  unsupported or lossy conversions. No automatic downgrade guarantee.

There is no pre-v1 migration. Future versions must extend the sequential
migration chain without changing the frozen contracts.

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
