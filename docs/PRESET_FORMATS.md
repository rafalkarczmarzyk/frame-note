# Preset format v1

[![Preset format: v1](https://img.shields.io/badge/preset_format-v1-14CC60?style=plastic)](../packages/core/src/preset-formats/v1.ts)

The first supported preset format is **v1**, introduced with `0.1.0-beta`.
Previous development JSON and storage are unsupported. No legacy parsers,
converters or transfer of old libraries are provided.

`packages/core/src/preset-formats/v1.ts` defines the Zod contract. All imports,
stored presets and exports pass this schema and SVG/PNG validation. Unknown
versions or fields are rejected rather than silently losing data. The preset
version is independent of application SemVer and is not a revision counter for
user edits. New files and exports have `version: 1`.

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

## Future format changes

From now on, every new format version requires:

- Its own frozen Zod schema and parser; do not change v1 to accept a new format.
- An explicit sequential migration from the previous supported version.
- A file conversion script using the same migration code as the application.
- Tests with fixtures from each supported format, including full-chain migration.
- Preservation of originals before persistent conversion, with clear errors for
  unsupported or lossy conversions. No automatic downgrade guarantee.

There are no migrations or migration scripts for v1: there is no previous
supported format. They are added when v2 is introduced.
