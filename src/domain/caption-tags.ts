import { heliconDetails, parseHeliconComment } from './helicon';
import type { MetadataCandidate, MetadataField } from './metadata';
import { resolvePhotographicIso } from './photographic-metadata';

export interface CaptionTag extends MetadataField {
  sources: readonly string[];
}
const definitions = {
  author: [
    'xmp:creator',
    'xmp:Artist',
    'exif:Artist',
    'iptc:By-line',
    'iptc:Byline',
  ],
  camera: ['exif:Model', 'xmp:Model'],
  lens: ['exif:LensModel', 'xmp:LensModel', 'xmp:Lens'],
  shutter: [
    'exif:ExposureTime',
    'xmp:ExposureTime',
    'exif:ShutterSpeedValue',
    'xmp:ShutterSpeedValue',
  ],
  aperture: [
    'exif:FNumber',
    'xmp:FNumber',
    'exif:ApertureValue',
    'xmp:ApertureValue',
  ],
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
  ],
  heliconStack: ['exif:UserComment', 'xmp:UserComment'],
  heliconStackCount: ['exif:UserComment', 'xmp:UserComment'],
  copyright: [
    'xmp:rights',
    'exif:Copyright',
    'iptc:Copyright Notice',
    'iptc:CopyrightNotice',
  ],
} as const;
const xmpNamespaces = {
  'author:xmp:creator': ['http://purl.org/dc/elements/1.1/'],
  'author:xmp:Artist': ['http://ns.adobe.com/tiff/1.0/'],
  'camera:xmp:Model': ['http://ns.adobe.com/tiff/1.0/'],
  'lens:xmp:LensModel': ['http://cipa.jp/exif/1.0/'],
  'lens:xmp:Lens': ['http://ns.adobe.com/exif/1.0/aux/'],
  'shutter:xmp:ExposureTime': ['http://ns.adobe.com/exif/1.0/'],
  'shutter:xmp:ShutterSpeedValue': ['http://ns.adobe.com/exif/1.0/'],
  'aperture:xmp:FNumber': ['http://ns.adobe.com/exif/1.0/'],
  'aperture:xmp:ApertureValue': ['http://ns.adobe.com/exif/1.0/'],
  'iso:xmp:PhotographicSensitivity': [
    'http://cipa.jp/exif/1.0/',
    'http://ns.adobe.com/exif/1.0/',
  ],
  'iso:xmp:ISOSpeedRatings': ['http://ns.adobe.com/exif/1.0/'],
  'iso:xmp:ISO': ['http://ns.adobe.com/exif/1.0/'],
  'focalLength:xmp:FocalLength': ['http://ns.adobe.com/exif/1.0/'],
  'date:xmp:DateTimeOriginal': ['http://ns.adobe.com/exif/1.0/'],
  'date:xmp:DateCreated': ['http://ns.adobe.com/photoshop/1.0/'],
  'heliconStack:xmp:UserComment': ['http://ns.adobe.com/exif/1.0/'],
  'heliconStackCount:xmp:UserComment': ['http://ns.adobe.com/exif/1.0/'],
  'copyright:xmp:rights': ['http://purl.org/dc/elements/1.1/'],
} as const satisfies Record<string, readonly string[]>;
export const captionTagNames = [...Object.keys(definitions), 'exposure'];

function sourceField(
  name: string,
  source: string,
  field: MetadataField,
): { field: MetadataField; source: string } | null {
  if (!source.startsWith('xmp:') || !field.candidates) return { field, source };
  const acceptedNamespaces =
    xmpNamespaces[`${name}:${source}` as keyof typeof xmpNamespaces];
  if (!acceptedNamespaces) return null;
  const candidate = field.candidates.find(
    (value) =>
      value.name === field.name &&
      acceptedNamespaces.some((namespace) => namespace === value.namespaceUri),
  );
  const candidates = field.candidates.filter(
    (value) =>
      value.name === field.name &&
      acceptedNamespaces.some((namespace) => namespace === value.namespaceUri),
  );
  if (!candidate) return null;
  const preferred =
    candidates.find((value) => value.language === 'x-default') ??
    candidates.find((value) =>
      value.language?.toLowerCase().startsWith('en'),
    ) ??
    candidate;
  return {
    field: candidateField(field, preferred),
    source: preferred.source,
  };
}

function candidateField(
  field: MetadataField,
  candidate: MetadataCandidate,
): MetadataField {
  return {
    ...field,
    rawValue: candidate.rawValue,
    displayValue: candidate.displayValue,
  };
}

function formattedDate(text: string): string {
  const match = text
    .trim()
    .match(/^(\d{4})[:-]?(\d{2})[:-]?(\d{2})(?:(?:[ T]|$).*)$/u);
  if (!match) return '';
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    return '';
  return `${yearText}-${monthText}-${dayText}`;
}

function numeric(raw: unknown, rational = true): number | null {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  if (typeof raw === 'string' && raw.trim()) {
    const fraction = rational
      ? raw.trim().match(/^([+-]?\d+(?:\.\d+)?)\/([+-]?\d+(?:\.\d+)?)$/)
      : null;
    if (fraction && Number(fraction[2]) === 0) return null;
    const result = fraction
      ? Number(fraction[1]) / Number(fraction[2])
      : Number(raw);
    return Number.isFinite(result) ? result : null;
  }
  if (Array.isArray(raw)) {
    if (
      rational &&
      raw.length === 2 &&
      raw.every((n) => typeof n === 'number')
    ) {
      if (raw[1] === 0) return null;
      const result = raw[0]! / raw[1]!;
      return Number.isFinite(result) ? result : null;
    }
    if (raw.length === 1) return numeric(raw[0], rational);
  }
  return null;
}
function format(name: string, field: MetadataField): string {
  const text = field.displayValue.trim();
  const allowRational = name !== 'iso';
  const number = numeric(field.rawValue, allowRational);
  const textNumber =
    typeof field.rawValue === 'string'
      ? numeric(
          text
            .replace(/^ISO\s*/i, '')
            .replace(/^f\s*\/?\s*/i, '')
            .replace(/\s*(?:s|sec|seconds?|mm)$/i, ''),
          allowRational,
        )
      : null;
  const value = number ?? textNumber;
  switch (name) {
    case 'heliconStackCount': {
      const details = heliconDetails(text);
      return details ? String(details.count) : '';
    }
    case 'heliconStack':
      return parseHeliconComment(text) ?? '';
    case 'shutter': {
      const apex = field.name === 'ShutterSpeedValue';
      const seconds = apex && value !== null ? 2 ** -value : value;
      if (seconds !== null && Number.isFinite(seconds) && seconds > 0) {
        const reciprocal = 1 / seconds;
        return seconds < 1 &&
          Math.abs(reciprocal - Math.round(reciprocal)) < 0.01
          ? `1/${Math.round(reciprocal)} s`
          : `${Number(seconds.toPrecision(6))} s`;
      }
      return '';
    }
    case 'aperture': {
      const apex = field.name === 'ApertureValue';
      const fNumber = apex && value !== null ? 2 ** (value / 2) : value;
      return fNumber !== null && Number.isFinite(fNumber) && fNumber > 0
        ? `f/${Number(fNumber.toFixed(2))}`
        : '';
    }
    case 'iso': {
      return value !== null && Number.isInteger(value) && value > 0
        ? `ISO ${value}`
        : '';
    }
    case 'focalLength': {
      return value !== null && Number.isFinite(value) && value > 0
        ? `${Number(value.toFixed(2))} mm`
        : '';
    }
    case 'date': {
      return formattedDate(text);
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
      if (name === 'iso') {
        const resolved = resolvePhotographicIso(fields);
        return {
          key: name,
          name,
          group: 'FrameNote',
          displayValue: resolved ? `ISO ${resolved.value}` : '',
          rawValue: resolved?.rawValue ?? null,
          sources: resolved?.sources ?? [],
        };
      }
      for (const source of candidates) {
        const field = byKey.get(source);
        if (!field || !field.displayValue.trim()) continue;
        const selected = sourceField(name, source, field);
        if (!selected || !selected.field.displayValue.trim()) continue;
        const displayValue = format(name, selected.field);
        if (displayValue)
          return {
            key: name,
            name,
            group: 'FrameNote',
            displayValue,
            rawValue: selected.field.rawValue,
            sources: [selected.source],
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
