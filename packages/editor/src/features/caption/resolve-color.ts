import {
  resolveCaptionColor,
  normalizeHex,
} from '../../../../core/src/caption-colors';

export function resolvedColor(value: string) {
  const resolved = resolveCaptionColor(value, (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(
      `--color-${name}`,
    ),
  ).toUpperCase();
  return normalizeHex(resolved) ?? resolved;
}
