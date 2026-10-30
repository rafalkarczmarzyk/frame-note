import type { ImageAsset } from './inline-image';
import type { SvgAsset } from './svg-asset';

/** Validate persisted and clipboard assets before handing their sources to a renderer. */
export function validateImageAssets(
  value: unknown,
  validateSvg: (name: string, source: string) => SvgAsset,
): ImageAsset[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 100)
    throw Error('Invalid image assets.');
  const ids = new Set<string>();
  return value.map((item: unknown) => {
    if (!item || typeof item !== 'object') throw Error('Invalid image asset.');
    const image = item as ImageAsset;
    if (
      typeof image.id !== 'string' ||
      !/^[a-zA-Z0-9-]{1,100}$/u.test(image.id) ||
      ids.has(image.id) ||
      typeof image.name !== 'string' ||
      image.name.length > 255 ||
      typeof image.source !== 'string'
    )
      throw Error('Invalid image asset.');
    ids.add(image.id);
    if (image.format === 'svg') {
      const svg = validateSvg('image', image.source);
      return {
        id: image.id,
        name: image.name,
        format: 'svg',
        source: svg.svg,
        width: svg.aspect,
        height: 1,
      };
    }
    if (
      image.format !== 'png' ||
      !/^data:image\/png;base64,[A-Za-z0-9+/]*={0,2}$/u.test(image.source) ||
      image.source.length > 2_666_700
    )
      throw Error('Invalid PNG asset.');
    const bytes = Uint8Array.from(atob(image.source.slice(22)), (char) =>
      char.charCodeAt(0),
    );
    if (
      bytes.length > 2_000_000 ||
      bytes.length < 33 ||
      bytes.slice(0, 8).join(',') !== '137,80,78,71,13,10,26,10' ||
      String.fromCharCode(...bytes.slice(12, 16)) !== 'IHDR'
    )
      throw Error('Invalid PNG asset.');
    const view = new DataView(bytes.buffer);
    const width = view.getUint32(16),
      height = view.getUint32(20);
    if (
      !width ||
      !height ||
      width > 16384 ||
      height > 16384 ||
      width * height > 32_000_000
    )
      throw Error('PNG exceeds 32 MP or 16384 pixels per side.');
    return {
      id: image.id,
      name: image.name,
      format: 'png',
      source: image.source,
      width,
      height,
    };
  });
}
