import type { MetadataField } from '@/domain/metadata';
import { resolveTemplate } from './template';
import type { SvgIcon } from './svg-icons';

export const iconMarker = (index: number) => `\uE000${index}\uE001`;
export function resolveCaptionContent(
  template: string,
  fields: readonly MetadataField[],
  available: readonly SvgIcon[],
) {
  const icons: SvgIcon[] = [];
  const missing: string[] = [];
  const replaced = template.replace(
    /\{icon:([^{}]*)\}/gu,
    (_, name: string) => {
      const icon = available.find((item) => item.name === name);
      if (!icon) {
        missing.push(`icon:${name}`);
        return '';
      }
      icons.push(icon);
      return iconMarker(icons.length - 1);
    },
  );
  const result = resolveTemplate(replaced, fields, template);
  return {
    ...result,
    missing: [...new Set([...result.missing, ...missing])],
    icons,
  };
}

export function inlineRuns(text: string) {
  const runs: ({ text: string } | { icon: number })[] = [];
  let offset = 0;
  for (const match of text.matchAll(/\uE000(\d+)\uE001/gu)) {
    if (match.index > offset)
      runs.push({ text: text.slice(offset, match.index) });
    runs.push({ icon: Number(match[1]) });
    offset = match.index + match[0].length;
  }
  if (offset < text.length) runs.push({ text: text.slice(offset) });
  return runs;
}
