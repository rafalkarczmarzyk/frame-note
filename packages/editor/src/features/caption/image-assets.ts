import { validateImageAssets } from '../../../../core/src/image-validation';
import type { ImageAsset } from '../../../../core/src/inline-image';
import { loadIcon, svgIcon, svgUrl } from './svg-icons';

export const imageSource = (asset: ImageAsset) =>
  asset.format === 'png' ? asset.source : svgUrl(asset.source);
export async function importImage(file: File, id: string): Promise<ImageAsset> {
  if (file.size > 2_000_000) throw Error('Image must be smaller than 2 MB.');
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (
    bytes[0] === 137 &&
    bytes[1] === 80 &&
    bytes[2] === 78 &&
    bytes[3] === 71
  ) {
    if (
      bytes.length < 33 ||
      bytes.slice(0, 8).join(',') !== '137,80,78,71,13,10,26,10'
    )
      throw Error('Invalid PNG.');
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
    const source = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(Error('Could not read PNG.'));
      reader.readAsDataURL(new Blob([bytes], { type: 'image/png' }));
    });
    return (
      await prepareImageAssets([
        { id, name: file.name, format: 'png', source, width, height },
      ])
    )[0]!;
  }
  const svg = svgIcon('image', new TextDecoder().decode(bytes));
  return (
    await prepareImageAssets([
      {
        id,
        name: file.name,
        format: 'svg',
        source: svg.svg,
        width: svg.aspect,
        height: 1,
      },
    ])
  )[0]!;
}

/** All ingress paths check cheap structural limits before decoding. */
export async function prepareImageAssets(
  value: unknown,
): Promise<ImageAsset[]> {
  const assets = validateImageAssets(value, svgIcon);
  await Promise.all(
    assets.map(async (asset) => {
      const decoded = await loadIcon({
        name: asset.name,
        svg: asset.source,
        aspect: asset.width / asset.height,
      });
      if (
        asset.format === 'png' &&
        (decoded.naturalWidth !== asset.width ||
          decoded.naturalHeight !== asset.height)
      )
        throw Error(`Invalid PNG dimensions: ${asset.name}`);
    }),
  );
  return assets;
}
