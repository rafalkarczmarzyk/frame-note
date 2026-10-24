import type { MetadataField } from '../../domain/metadata';

export interface ResolvedTemplate {
  text: string;
  missing: string[];
  invalidSyntax: boolean;
}

export function resolveTemplate(
  template: string,
  fields: readonly MetadataField[],
): ResolvedTemplate {
  const values = new Map(
    fields.map((field) => [field.key, field.displayValue]),
  );
  const missing = new Set<string>();
  let invalidSyntax = false;
  const text = template.replace(/\{([^{}]*)\}/gu, (_, key: string) => {
    if (!key || !key.includes(':')) invalidSyntax = true;
    if (!values.has(key)) {
      missing.add(key);
      return '';
    }
    return values.get(key) ?? '';
  });
  if (/[{}]/u.test(template.replace(/\{[^{}]*\}/gu, ''))) invalidSyntax = true;
  return {
    text: text
      .split(/\r?\n/u)
      .filter((line) => line.trim())
      .join('\n'),
    missing: [...missing],
    invalidSyntax,
  };
}
