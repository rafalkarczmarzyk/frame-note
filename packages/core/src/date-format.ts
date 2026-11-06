/** A date format is local to a token; capture dates never undergo timezone conversion. */
export const defaultDateFormat = 'YYYY-MM-DD';
export const dateFormats = [
  'YYYY-MM-DD',
  'DD.MM.YYYY',
  'YYYY/MM/DD',
  'YYYY/MM/DD HH:mm',
  "'YY MM DD",
  "DD MM 'YY",
] as const;
export function validDateFormat(pattern: string): boolean {
  if (!pattern || pattern.length > 64) return false;
  const parts = pattern.match(/YYYY|YY|MM|M|DD|D|HH|mm/g) ?? [];
  return (
    parts.filter((p) => p.startsWith('Y')).length === 1 &&
    parts.filter((p) => p.startsWith('M')).length === 1 &&
    parts.filter((p) => p.startsWith('D')).length === 1 &&
    parts.filter((p) => p === 'HH').length ===
      parts.filter((p) => p === 'mm').length &&
    parts.filter((p) => p === 'HH').length <= 1 &&
    /^[ ./'’_:-]*$/.test(pattern.replace(/YYYY|YY|MM|M|DD|D|HH|mm/g, ''))
  );
}
export function parseDateToken(token: string): { format: string } | null {
  if (token === 'date') return { format: defaultDateFormat };
  if (!token.startsWith('date:')) return null;
  try {
    const format = decodeURIComponent(token.slice(5));
    return validDateFormat(format) ? { format } : null;
  } catch {
    return null;
  }
}
export function dateToken(format: string): string {
  if (!validDateFormat(format)) throw Error('Invalid date format.');
  return format === defaultDateFormat
    ? 'date'
    : `date:${encodeURIComponent(format)}`;
}
export function formatCaptureDate(date: string, pattern: string): string {
  if (!validDateFormat(pattern)) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}))?$/.exec(date);
  if (!match) return '';
  const [, year, month, day, hour, minute] = match;
  if (pattern.includes('HH') && (hour === undefined || minute === undefined))
    return '';
  const parts: Record<string, string> = {
    HH: hour ?? '',
    mm: minute ?? '',
    YYYY: year!,
    YY: year!.slice(2),
    MM: month!,
    M: String(Number(month)),
    DD: day!,
    D: String(Number(day)),
  };
  return pattern.replace(/YYYY|YY|MM|M|DD|D|HH|mm/g, (part) => parts[part]!);
}
export function dateTokenValue(
  token: string,
  values: Readonly<Record<string, string>>,
): string | undefined {
  const date = parseDateToken(token);
  return date
    ? formatCaptureDate(
        (date.format.includes('HH') ? values.dateTime : values.date) ?? '',
        date.format,
      )
    : values[token];
}
