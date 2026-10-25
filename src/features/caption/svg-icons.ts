import type { SvgAsset } from '../../domain/svg-asset';
export type SvgIcon = SvgAsset;

export function svgIcon(name: string, source: string): SvgIcon {
  if (!/^[a-z][a-z0-9-]{0,47}$/u.test(name))
    throw Error(
      'Use a name such as aperture or my-camera (letters, digits and hyphens).',
    );
  if (source.length > 256_000) throw Error('SVG must be smaller than 256 KB.');
  if (/<!DOCTYPE|<!ENTITY/iu.test(source))
    throw Error('SVG must not contain a document type or entities.');
  const doc = new DOMParser().parseFromString(source, 'image/svg+xml');
  const root = doc.documentElement;
  if (root.localName !== 'svg' || doc.querySelector('parsererror'))
    throw Error('Choose a valid SVG file.');
  const allowed = new Set([
    'svg',
    'g',
    'path',
    'circle',
    'ellipse',
    'rect',
    'line',
    'polyline',
    'polygon',
    'defs',
    'linearGradient',
    'radialGradient',
    'stop',
    'clipPath',
    'mask',
    'use',
    'title',
    'desc',
  ]);
  const elements = [root, ...Array.from(root.querySelectorAll('*'))];
  if (elements.length > 2000)
    throw Error('SVG is too complex (maximum 2000 elements).');
  for (const element of elements) {
    if (!allowed.has(element.localName))
      throw Error(
        `Unsupported SVG element: ${element.localName}. Convert text to paths and remove embedded images or styles.`,
      );
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name === 'xmlns' || attribute.name === 'xmlns:xlink')
        continue;
      const value = attribute.value;
      if (
        /^on/iu.test(attribute.localName) ||
        /(?:javascript:|https?:|data:|@import|expression\s*\()/iu.test(value) ||
        /url\(\s*['"]?(?!#)/iu.test(value) ||
        (attribute.localName === 'href' && !value.startsWith('#'))
      )
        throw Error(
          'SVG must be self-contained, without scripts or external resources.',
        );
    }
  }
  const viewBox = root
    .getAttribute('viewBox')
    ?.trim()
    .split(/[\s,]+/u)
    .map(Number);
  const width =
    viewBox?.[2] ?? Number(root.getAttribute('width')?.replace(/px$/u, ''));
  const height =
    viewBox?.[3] ?? Number(root.getAttribute('height')?.replace(/px$/u, ''));
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width! <= 0 ||
    height! <= 0 ||
    width! / height! > 100 ||
    height! / width! > 100
  )
    throw Error('SVG needs a valid viewBox or positive width and height.');
  if (!viewBox) root.setAttribute('viewBox', `0 0 ${width} ${height}`);
  root.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const ratio = width! / height!;
  root.setAttribute('width', String(ratio >= 1 ? 512 : 512 * ratio));
  root.setAttribute('height', String(ratio >= 1 ? 512 / ratio : 512));
  if (!root.hasAttribute('color')) root.setAttribute('color', 'black');
  return {
    name,
    svg: new XMLSerializer().serializeToString(root),
    aspect: width! / height!,
  };
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
