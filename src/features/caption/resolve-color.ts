import { resolveCaptionColor } from '@/domain/caption-colors';

export function resolvedColor(value: string) {
  return resolveCaptionColor(value, (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(
      `--color-${name}`,
    ),
  ).toUpperCase();
}
