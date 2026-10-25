import { heliconDetails, parseHeliconComment } from './helicon';
import type { MetadataCandidate, MetadataField } from './metadata';

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
  'camera:xmp:Model': ['http://ns.adobe.com/tiff/1.0/'],
  'lens:xmp:LensModel': ['http://cipa.jp/exif/1.0/'],
  'lens:xmp:Lens': ['http://ns.adobe.com/exif/1.0/aux/'],
  'shutter:xmp:ExposureTime': ['http://ns.adobe.com/exif/1.0/'],
  'aperture:xmp:FNumber': ['http://ns.adobe.com/exif/1.0/'],
  'iso:xmp:PhotographicSensitivity': [
    'http://cipa.jp/exif/1.0/',
    'http://ns.adobe.com/exif/1.0/',
  ],
  'iso:xmp:ISOSpeedRatings': ['http://ns.adobe.com/exif/1.0/'],
  'iso:xmp:ISO': ['http://ns.adobe.com/exif/1.0/'],
  'focalLength:xmp:FocalLength': ['http://ns.adobe.com/exif/1.0/'],
  'date:xmp:DateTimeOriginal': ['http://ns.adobe.com/exif/1.0/'],
  'date:xmp:DateCreated': ['http://ns.adobe.com/photoshop/1.0/'],
  'date:xmp:CreateDate': ['http://ns.adobe.com/xap/1.0/'],
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
  if (!candidate) return null;
  return { field: candidateField(field, candidate), source: candidate.source };
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
    case 'heliconStackCount': {
      const details = heliconDetails(text);
      return details ? String(details.count) : '';
    }
    case 'heliconStack':
      return parseHeliconComment(text) ?? '';
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
