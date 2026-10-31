# Preset format v1

The first supported preset format is **v1**, introduced with `0.1.0-beta`.
Previous development JSON and storage are unsupported. No legacy parsers,
converters or transfer of old libraries are provided.

`packages/core/src/preset-formats/v1.ts` defines the Zod contract. All imports,
stored presets and exports pass this schema and SVG/PNG validation. Unknown
versions or fields are rejected rather than silently losing data. The preset
version is independent of application SemVer and is not a revision counter for
user edits. New files and exports have `version: 1`.

From now on, every new format version requires:

- Its own frozen Zod schema and parser; do not change v1 to accept a new format.
- An explicit sequential migration from the previous supported version.
- A file conversion script using the same migration code as the application.
- Tests with fixtures from each supported format, including full-chain migration.
- Preservation of originals before persistent conversion, with clear errors for
  unsupported or lossy conversions. No automatic downgrade guarantee.

There are no migrations or migration scripts for v1: there is no previous
supported format. They are added when v2 is introduced.
