import {
  parseDateToken,
  dateTokenValue,
} from '../../../../../core/src/date-format';
import { captionTagNames } from '../../../../../core/src/caption-tags';

export function metadataTokenStatus(
  token: string,
  values: Readonly<Record<string, string>>,
): 'value' | 'empty' | 'absent' {
  if (dateTokenValue(token, values)?.trim()) return 'value';
  return !!parseDateToken(token) ||
    captionTagNames.includes(token) ||
    Object.hasOwn(values, token)
    ? 'empty'
    : 'absent';
}
