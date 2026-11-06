/** Formatting belongs to each token; capture timestamps never undergo timezone conversion. */
export const defaultDateFormat = 'YYYY-MM-DD';
/** Native upper-right segment used as the short-year mark in 7-Segment. */
export const segmentYearMark = '\uF062';
/** UI labels use a readable quote; the canvas retains the native segment. */
export const dateFormatLabel = (format: string) =>
  format.replaceAll(segmentYearMark, "'");
export const dateLocales = ['en', 'pl'] as const;
export type DateLocale = (typeof dateLocales)[number];
export const dateFormats = [
  'YYYY-MM-DD',
  'DD.MM.YYYY',
  'D MMM YYYY',
  "'YY MM DD",
] as const;
const symbols = /YYYY|MMMM|MMM|YY|MM|DD|HH|hh|M|D|h|mm|A/g;
export const hasCaptureTime = (pattern: string) => /HH|hh|h/.test(pattern);
export function validDateFormat(pattern: string, timeOnly = false): boolean {
  if (!pattern || pattern.length > 64) return false;
  const parts = pattern.match(symbols) ?? [];
  const count = (test: RegExp) =>
    parts.filter((part) => test.test(part)).length;
  const hours24 = count(/^HH$/);
  const hours12 = count(/^(hh|h)$/);
  return (
    count(/^Y/) === (timeOnly ? 0 : 1) &&
    count(/^M/) === (timeOnly ? 0 : 1) &&
    count(/^D/) === (timeOnly ? 0 : 1) &&
    hours24 + hours12 === count(/^mm$/) &&
    hours24 + hours12 <= 1 &&
    (!timeOnly || hours24 + hours12 === 1) &&
    count(/^A$/) === hours12 &&
    /^[ ./'’_:\uF062-]*$/.test(pattern.replace(symbols, ''))
  );
}
export interface DateTokenSettings {
  format: string;
  locale?: DateLocale;
  kind?: 'time';
}
export function parseDateToken(token: string): DateTokenSettings | null {
  if (token === 'date') return { format: defaultDateFormat };
  if (token === 'time') return { format: 'HH:mm', kind: 'time' };
  const match = /^(date|time):([^|]+)(?:\|(en|pl))?$/.exec(token);
  if (!match) return null;
  try {
    const format = decodeURIComponent(match[2]!);
    if (!validDateFormat(format, match[1] === 'time')) return null;
    return {
      format,
      ...(match[3] ? { locale: match[3] as DateLocale } : {}),
      ...(match[1] === 'time' ? { kind: 'time' as const } : {}),
    };
  } catch {
    return null;
  }
}
export function dateToken(
  format: string,
  locale?: DateLocale,
  kind?: 'time',
): string {
  if (
    !validDateFormat(format, kind === 'time') ||
    (locale !== undefined && !dateLocales.includes(locale))
  )
    throw Error('Invalid date format.');
  const name = kind ?? 'date';
  if (!locale && format === (kind === 'time' ? 'HH:mm' : defaultDateFormat))
    return name;
  return `${name}:${encodeURIComponent(format)}${locale ? `|${locale}` : ''}`;
}
export function formatCaptureDate(
  date: string,
  pattern: string,
  locale: DateLocale = 'en',
  timeOnly = false,
): string {
  if (!validDateFormat(pattern, timeOnly) || !dateLocales.includes(locale))
    return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}))?$/.exec(date);
  const time = timeOnly ? /^(\d{2}):(\d{2})$/.exec(date) : null;
  if (!match && !time) return '';
  const [, year, month, day, dateHour, dateMinute] = match ?? [];
  const hour = dateHour ?? time?.[1];
  const minute = dateMinute ?? time?.[2];
  if (
    hasCaptureTime(pattern) &&
    (hour === undefined || minute === undefined || +hour > 23 || +minute > 59)
  )
    return '';
  const calendar = new Date(0);
  if (match) {
    calendar.setUTCFullYear(Number(year), Number(month) - 1, Number(day));
    if (
      calendar.getUTCFullYear() !== Number(year) ||
      calendar.getUTCMonth() !== Number(month) - 1 ||
      calendar.getUTCDate() !== Number(day)
    )
      return '';
  }
  const monthName = (width: 'short' | 'long') =>
    new Intl.DateTimeFormat(locale, {
      month: width,
      day: 'numeric',
      timeZone: 'UTC',
      calendar: 'gregory',
    })
      .formatToParts(calendar)
      .find((part) => part.type === 'month')?.value ?? '';
  const parts: Record<string, string> = {
    HH: hour ?? '',
    hh: String(Number(hour) % 12 || 12).padStart(2, '0'),
    h: String(Number(hour) % 12 || 12),
    A: Number(hour) < 12 ? 'AM' : 'PM',
    mm: minute ?? '',
    YYYY: year ?? '',
    YY: year?.slice(2) ?? '',
    MMMM: pattern.includes('MMMM') ? monthName('long') : '',
    MMM: pattern.includes('MMM') ? monthName('short') : '',
    MM: month ?? '',
    M: String(Number(month)),
    DD: day ?? '',
    D: String(Number(day)),
  };
  return pattern.replace(symbols, (part) => parts[part]!);
}
export function dateTokenSource(
  settings: DateTokenSettings,
): 'date' | 'dateTime' | 'time' {
  return settings.kind === 'time'
    ? 'time'
    : hasCaptureTime(settings.format)
      ? 'dateTime'
      : 'date';
}
export function dateTokenValue(
  token: string,
  values: Readonly<Record<string, string>>,
): string | undefined {
  const date = parseDateToken(token);
  return date
    ? formatCaptureDate(
        values[dateTokenSource(date)] ?? '',
        date.format,
        date.locale,
        date.kind === 'time',
      )
    : values[token];
}
