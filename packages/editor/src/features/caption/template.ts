import {
  captionTags,
  captionTagNames,
} from '../../../../core/src/caption-tags';
import type { MetadataField } from '../../../../core/src/metadata';

export interface ResolvedTemplate {
  text: string;
  missing: string[];
  invalidSyntax: boolean;
}

export function resolveTemplate(
  template: string,
  fields: readonly MetadataField[],
  sourceTemplate = template,
): ResolvedTemplate {
  const values = new Map(
    [...captionTags(fields), ...fields]
      .filter((field) => field.displayValue.trim())
      .map((field) => [field.key, field.displayValue]),
  );
  const missing = new Set<string>();
  let invalidSyntax = false;
  const sourceLines = sourceTemplate.split(/\r?\n/u);
  const text = template
    .split(/\r?\n/u)
    .map((line, index) => {
      const resolved = line.replace(/\{([^{}]*)\}/gu, (_, key: string) => {
        if (!key || (!key.includes(':') && !captionTagNames.includes(key)))
          invalidSyntax = true;
        if (!values.has(key)) {
          missing.add(key);
          return '';
        }
        return values.get(key) ?? '';
      });
      // Empty source lines represent intentional spacing; missing-only lines do not.
      return resolved.trim() || !sourceLines[index]?.trim() ? resolved : null;
    })
    .filter((line): line is string => line !== null)
    .join('\n');
  if (/[{}]/u.test(template.replace(/\{[^{}]*\}/gu, ''))) invalidSyntax = true;
  return {
    text,
    missing: [...missing],
    invalidSyntax,
  };
}
