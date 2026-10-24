/** Source groups stay open so new metadata formats do not require a UI change. */
export interface MetadataField {
  /** Stable source-qualified identity, also used inside template tokens. */
  key: string;
  group: string;
  name: string;
  /** Human-readable value produced by the metadata adapter. Never HTML. */
  displayValue: string;
  /** Original reader value retained for future formatting. */
  rawValue: unknown;
}

export function metadataKey(group: string, name: string): string {
  // A colon separates the group; braces delimit the token syntax.
  if (
    ![group, name].every(
      (part) => part.trim().length > 0 && !/[{}:\r\n]/u.test(part),
    )
  ) {
    throw new Error(
      'Metadata group and name must be non-empty token-safe strings.',
    );
  }
  return `${group}:${name}`;
}

export function createMetadataField(
  input: Omit<MetadataField, 'key'>,
): MetadataField {
  return { ...input, key: metadataKey(input.group, input.name) };
}
