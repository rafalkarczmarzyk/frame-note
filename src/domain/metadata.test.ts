import { describe, expect, it } from 'vitest';
import { createMetadataField, metadataKey } from './metadata';

describe('metadata identity', () => {
  it('keeps identical EXIF and XMP names distinct', () => {
    expect(metadataKey('exif', 'LensModel')).not.toBe(
      metadataKey('xmp', 'LensModel'),
    );
  });
  it('supports names from additional reader groups without a whitelist', () => {
    const field = createMetadataField({
      group: 'custom',
      name: 'Stack Count',
      displayValue: '49',
      rawValue: 49,
    });
    expect(field.key).toBe('custom:Stack Count');
    expect(field.rawValue).toBe(49);
  });
  it.each(['', ' ', 'broken:key', '{key}', 'line\nbreak'])(
    'rejects ambiguous token identity %j',
    (part) => {
      expect(() => metadataKey(part, 'Artist')).toThrow();
      expect(() => metadataKey('exif', part)).toThrow();
    },
  );
});
