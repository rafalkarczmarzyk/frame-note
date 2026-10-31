import { validateSvgAsset } from '../../../../core/src/svg-validation';
import type { SvgAsset } from '../../../../core/src/svg-asset';
export type SvgIcon = SvgAsset;

export function svgIcon(name: string, source: string): SvgIcon {
  return validateSvgAsset(name, source, {
    parse: (value) => new DOMParser().parseFromString(value, 'image/svg+xml'),
    serialize: (element) => new XMLSerializer().serializeToString(element),
  });
}

export function svgUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
const images = new Map<string, Promise<HTMLImageElement>>();
export function loadIcon(icon: SvgIcon) {
  let pending = images.get(icon.svg);
  if (!pending) {
    pending = new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => {
        images.delete(icon.svg);
        reject(Error(`Could not render icon: ${icon.name}`));
      };
      image.src = icon.svg.startsWith('data:image/png;base64,')
        ? icon.svg
        : svgUrl(icon.svg);
    });
    images.set(icon.svg, pending);
    if (images.size > 64) images.delete(images.keys().next().value!);
  }
  return pending;
}
