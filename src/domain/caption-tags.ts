import type { MetadataField } from './metadata';

export interface CaptionTag extends MetadataField {
  sources: readonly string[];
}
const definitions = {
  author: ['xmp:creator', 'exif:Artist', 'iptc:By-line', 'iptc:Byline'],
  camera: ['exif:Model', 'xmp:Model'],
  lens: ['exif:LensModel', 'xmp:LensModel', 'xmp:Lens'],
  shutter: ['exif:ExposureTime', 'xmp:ExposureTime'],
  aperture: ['exif:FNumber', 'xmp:FNumber'],
  iso: [
    'exif:PhotographicSensitivity',
    'exif:ISOSpeedRatings',
    'exif:ISO',
    'xmp:PhotographicSensitivity',
    'xmp:ISOSpeedRatings',
    'xmp:ISO',
  ],
  focalLength: ['exif:FocalLength', 'xmp:FocalLength'],
  date: [
    'exif:DateTimeOriginal',
    'xmp:DateTimeOriginal',
    'iptc:DateCreated',
    'xmp:DateCreated',
    'xmp:CreateDate',
  ],
  copyright: [
    'xmp:rights',
    'exif:Copyright',
    'iptc:Copyright Notice',
    'iptc:CopyrightNotice',
  ],
} as const;
export const captionTagNames = [...Object.keys(definitions), 'exposure'];

function numeric(raw: unknown): number | null {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  if (typeof raw === 'string' && raw.trim()) {
    const fraction = raw.trim().match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
    const result = fraction
      ? Number(fraction[1]) / Number(fraction[2])
      : Number(raw);
    return Number.isFinite(result) ? result : null;
  }
  if (Array.isArray(raw)) {
    if (raw.length === 2 && raw.every((n) => typeof n === 'number')) {
      const result = raw[0]! / raw[1]!;
      return Number.isFinite(result) ? result : null;
    }
    if (raw.length === 1) return numeric(raw[0]);
  }
  return null;
}
function format(name: string, field: MetadataField): string {
  const text = field.displayValue.trim();
  const number = numeric(field.rawValue);
  switch (name) {
    case 'shutter': {
      if (number !== null && number > 0) {
        const reciprocal = 1 / number;
        return number < 1 &&
          Math.abs(reciprocal - Math.round(reciprocal)) < 0.01
          ? `1/${Math.round(reciprocal)} s`
          : `${Number(number.toPrecision(6))} s`;
      }
      const fallback = numeric(text.replace(/\s*(?:s|sec|seconds?)$/i, ''));
      return fallback !== null && fallback > 0 ? `${fallback} s` : '';
    }
    case 'aperture': {
      const value = number ?? Number(text.replace(/^f\s*\/?\s*/i, ''));
      return Number.isFinite(value) && value > 0
        ? `f/${Number(value.toFixed(2))}`
        : '';
    }
    case 'iso': {
      const value = number ?? Number(text.replace(/^ISO\s*/i, ''));
      return Number.isFinite(value) && value > 0 ? `ISO ${value}` : '';
    }
    case 'focalLength': {
      const value = number ?? Number(text.replace(/\s*mm$/i, ''));
      return Number.isFinite(value) && value > 0
        ? `${Number(value.toFixed(2))} mm`
        : '';
    }
    case 'date': {
      const match = text.match(/^(\d{4})[:-]?(\d{2})[:-]?(\d{2})(?:\b|T)/);
      return match ? `${match[1]}-${match[2]}-${match[3]}` : '';
    }
    default:
      return text;
  }
}

/** Derived helpers never mutate, remove or replace original metadata. */
export function captionTags(fields: readonly MetadataField[]): CaptionTag[] {
  const byKey = new Map(fields.map((field) => [field.key, field]));
  const helpers = Object.entries(definitions).map(
    ([name, candidates]): CaptionTag => {
      for (const source of candidates) {
        const field = byKey.get(source);
        if (!field || !field.displayValue.trim()) continue;
        const displayValue = format(name, field);
        if (displayValue)
          return {
            key: name,
            name,
            group: 'FrameNote',
            displayValue,
            rawValue: field.rawValue,
            sources: [source],
          };
      }
      return {
        key: name,
        name,
        group: 'FrameNote',
        displayValue: '',
        rawValue: null,
        sources: [],
      };
    },
  );
  const exposure = ['shutter', 'aperture', 'iso']
    .map((key) => helpers.find((tag) => tag.key === key)!)
    .filter((tag) => tag.displayValue);
  return [
    ...helpers,
    {
      key: 'exposure',
      name: 'exposure',
      group: 'FrameNote',
      displayValue: exposure.map((tag) => tag.displayValue).join(' · '),
      rawValue: null,
      sources: exposure.flatMap((tag) => tag.sources),
    },
  ];
}

export function metadataGroups(
  fields: readonly MetadataField[],
  query: string,
) {
  const text = query.trim().toLowerCase();
  const items = [
    ...captionTags(fields),
    ...fields.map((field) => ({ ...field, sources: [] as readonly string[] })),
  ].filter((field) =>
    `${field.key} ${field.group} ${field.displayValue} ${'sources' in field ? field.sources.join(' ') : ''}`
      .toLowerCase()
      .includes(text),
  );
  const groups = [...new Set(items.map((field) => field.group))].sort(
    (a, b) => {
      const order = ['FrameNote', 'exif', 'xmp', 'iptc'];
      const index = (value: string) =>
        order.includes(value) ? order.indexOf(value) : order.length;
      return index(a) - index(b) || a.localeCompare(b);
    },
  );
  return groups.map((group) => ({
    name: group,
    fields: items.filter((field) => field.group === group),
  }));
}
