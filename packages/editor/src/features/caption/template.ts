import {
  parseDateToken,
  formatCaptureDate,
} from '../../../../core/src/date-format';
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
      let missingMetadata = false;
      const resolved = line.replace(/\{([^{}]*)\}/gu, (_, key: string) => {
        const date = parseDateToken(key);
        if (key.startsWith('date:') && !date) invalidSyntax = true;
        if (!key || (!key.includes(':') && !captionTagNames.includes(key)))
          invalidSyntax = true;
        const valueKey = date
          ? date.format.includes('HH')
            ? 'dateTime'
            : 'date'
          : key;
        if (!values.has(valueKey)) {
          if (date || captionTagNames.includes(key)) missingMetadata = true;
          missing.add(key);
          return '';
        }
        return date
          ? formatCaptureDate(values.get(valueKey) ?? '', date.format)
          : (values.get(key) ?? '');
      });
      // Do not leave decorative icons alone when their metadata line is empty.
      if (
        missingMetadata &&
        !/\{(?:image|separator):/u.test(sourceLines[index] ?? '') &&
        !resolved.replace(/\uE000\d+\uE001/gu, '').trim()
      )
        return null;
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
