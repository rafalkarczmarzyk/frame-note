# Preset format compatibility

Audit: 2026-10-31. Application SemVer and preset format versions are independent.

| Format | Historical source                                | Contract and conversion                                                                                                                               |
| ------ | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | `a60aa97:src/domain/presets.ts`                  | Text, icons, optional standalone SVG logo. Convert logo to an inline image using the existing geometry-preserving conversion.                         |
| 2      | `0ad9790:src/domain/presets.ts`, later `bab5a30` | Inline SVG/PNG; later optional visibility, italic and layer background fields. Preserve all recognized variants.                                      |
| 3      | First beta                                       | Freeze the currently supported fields, remove standalone logos through migration, reject unknown persisted fields rather than silently dropping them. |

The v1/v2 fixture files in `tests/fixtures/presets` are reconstructed examples
of the audited historical contracts (not recovered user files). They retain
historical defaults and exercise standalone-logo and inline-image conversion.
Existing domain/export fixtures provide background, PNG and separator coverage.

Each version has its own Zod parser. Historical v1/v2 retain optional additions
that the old shared parser accepted; v3 is a separate frozen schema, not an alias
for the runtime model. Schema definitions shared by versions must be frozen too.
A new persisted field or changed meaning requires a new format version, schema,
migration and fixture, not an in-place relaxation of an old schema.

Read path: validate source version → migrate 1 to 2 → migrate 2 to 3 → validate
v3 → validate embedded SVG/PNG → application data. Current writes use v3.
Unsupported future versions, unknown fields and invalid data are rejected with
original bytes retained for recovery. No downgrade guarantee is provided.
Defaults may only be added when their historical meaning is known; unsupported
lossy conversions must fail, preserving the source. No silent best-effort drop.
