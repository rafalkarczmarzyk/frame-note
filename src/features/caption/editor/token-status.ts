import { captionTagNames } from '../../../domain/caption-tags';

export function metadataTokenStatus(
  token: string,
  values: Readonly<Record<string, string>>,
): 'value' | 'empty' | 'absent' {
  if (values[token]?.trim()) return 'value';
  return captionTagNames.includes(token) || Object.hasOwn(values, token)
    ? 'empty'
    : 'absent';
}
