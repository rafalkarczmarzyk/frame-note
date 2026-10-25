import {
  createMetadataField,
  type MetadataCandidate,
  type MetadataField,
} from '../../domain/metadata';

export function normalizeMetadata(
  groups: unknown,
  candidates: readonly MetadataCandidate[] = [],
): MetadataField[] {
  if (!groups || typeof groups !== 'object') return [];
  const fields: MetadataField[] = [];
  for (const [group, tags] of Object.entries(groups)) {
    if (!tags || typeof tags !== 'object' || group === 'Thumbnail') continue;
    for (const [name, tag] of Object.entries(tags)) {
      if (!tag || typeof tag !== 'object' || !('value' in tag)) continue;
      const value: unknown = tag.value;
      const description: unknown =
        'description' in tag ? tag.description : value;
      const displayValue =
        typeof description === 'string'
          ? description
          : (JSON.stringify(description ?? value) ?? '');
      fields.push(
        createMetadataField({
          group,
          name,
          rawValue: value,
          displayValue,
          ...(group === 'xmp' &&
          candidates.some((candidate) => candidate.name === name)
            ? {
                candidates: candidates.filter(
                  (candidate) => candidate.name === name,
                ),
              }
            : {}),
        }),
      );
    }
  }
  return fields.sort((a, b) => a.key.localeCompare(b.key));
}

export function isJpeg(bytes: Uint8Array): boolean {
  return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

export type SupportedImage = 'image/jpeg' | 'image/png';

const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10] as const;

export function imageType(bytes: Uint8Array): SupportedImage | null {
  if (isJpeg(bytes)) return 'image/jpeg';
  if (pngSignature.every((byte, index) => bytes[index] === byte))
    return 'image/png';
  return null;
}

export function pngDimensions(bytes: Uint8Array): {
  width: number;
  height: number;
} | null {
  if (
    imageType(bytes) !== 'image/png' ||
    bytes.length < 24 ||
    String.fromCharCode(...bytes.subarray(12, 16)) !== 'IHDR'
  )
    return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}
