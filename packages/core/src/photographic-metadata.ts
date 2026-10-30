import type { MetadataCandidate, MetadataField } from './metadata';

const xmpNamespaces = {
  PhotographicSensitivity: [
    'http://cipa.jp/exif/1.0/',
    'http://ns.adobe.com/exif/1.0/',
  ],
  ISOSpeedRatings: ['http://ns.adobe.com/exif/1.0/'],
  ISO: ['http://ns.adobe.com/exif/1.0/'],
  SensitivityType: ['http://cipa.jp/exif/1.0/'],
  StandardOutputSensitivity: ['http://cipa.jp/exif/1.0/'],
  RecommendedExposureIndex: ['http://cipa.jp/exif/1.0/'],
  ISOSpeed: ['http://cipa.jp/exif/1.0/'],
} as const;

interface TaggedNumber {
  value: number;
  source: string;
}

interface TagRead {
  found: boolean;
  conflict: boolean;
  values: TaggedNumber[];
}

export interface ResolvedPhotographicIso {
  value: number;
  rawValue: number;
  sources: readonly string[];
}

function scalarNumber(rawValue: unknown): number | null {
  if (Array.isArray(rawValue)) {
    if (rawValue.length !== 1) return null;
    return scalarNumber(rawValue[0]);
  }
  if (typeof rawValue === 'number' && Number.isFinite(rawValue))
    return rawValue;
  if (typeof rawValue === 'string' && /^\d+$/u.test(rawValue.trim())) {
    const parsed = Number(rawValue.trim());
    return Number.isSafeInteger(parsed) ? parsed : null;
  }
  return null;
}

function readTag(
  fields: readonly MetadataField[],
  group: string,
  name: keyof typeof xmpNamespaces | 'ISO' | 'ISOSpeedRatings',
): TagRead {
  const field = fields.find(
    (candidate) => candidate.group === group && candidate.name === name,
  );
  if (!field) return { found: false, conflict: false, values: [] };

  let candidates: readonly MetadataCandidate[];
  if (group === 'xmp') {
    if (field.candidates) {
      const namespaces = xmpNamespaces[name as keyof typeof xmpNamespaces];
      if (!namespaces) return { found: true, conflict: false, values: [] };
      candidates = field.candidates.filter(
        (candidate) =>
          candidate.name === name &&
          namespaces.some((namespace) => namespace === candidate.namespaceUri),
      );
    } else {
      candidates = [
        {
          group,
          name,
          source: field.key,
          rawValue: field.rawValue,
          displayValue: field.displayValue,
        },
      ];
    }
  } else {
    candidates = [
      {
        group,
        name,
        source: field.key,
        rawValue: field.rawValue,
        displayValue: field.displayValue,
      },
    ];
  }

  const values = candidates.flatMap((candidate) => {
    const value = scalarNumber(candidate.rawValue);
    return value === null ? [] : [{ value, source: candidate.source }];
  });
  const distinctValues = new Set(values.map(({ value }) => value));
  return {
    found: true,
    conflict: distinctValues.size > 1,
    values,
  };
}

function firstValue(reads: readonly TagRead[]): TaggedNumber | null {
  const available = reads.flatMap((read) => read.values);
  if (reads.some((read) => read.conflict)) return null;
  const distinctValues = new Set(available.map(({ value }) => value));
  if (distinctValues.size > 1) return null;
  return available[0] ?? null;
}

function resolveSourceGroup(
  fields: readonly MetadataField[],
  group: 'exif' | 'xmp',
): ResolvedPhotographicIso | null {
  const primaryReads = [
    readTag(fields, group, 'PhotographicSensitivity'),
    readTag(fields, group, 'ISOSpeedRatings'),
    ...(group === 'exif' ? [readTag(fields, group, 'ISO')] : []),
  ];
  const primary = firstValue(primaryReads);
  const sensitivityTypeRead = readTag(fields, group, 'SensitivityType');
  const sensitivityType = firstValue([sensitivityTypeRead]);
  if (sensitivityTypeRead.conflict) return null;

  if (!sensitivityType || sensitivityType.value === 0) {
    if (!primary || primary.value <= 0 || primary.value >= 65535) return null;
    return {
      value: primary.value,
      rawValue: primary.value,
      sources: [primary.source],
    };
  }

  const type = sensitivityType.value;
  if (!Number.isInteger(type) || type < 1 || type > 7) return null;
  const designated = [
    ...(type === 1 || type === 4 || type === 5 || type === 7
      ? [readTag(fields, group, 'StandardOutputSensitivity')]
      : []),
    ...(type === 2 || type === 4 || type === 6 || type === 7
      ? [readTag(fields, group, 'RecommendedExposureIndex')]
      : []),
    ...(type === 3 || type === 5 || type === 6 || type === 7
      ? [readTag(fields, group, 'ISOSpeed')]
      : []),
  ];
  const parameter = firstValue(designated);
  if (designated.some((read) => read.conflict)) return null;

  if (primary && primary.value > 0 && primary.value < 65535) {
    if (parameter && parameter.value !== primary.value) return null;
    return {
      value: primary.value,
      rawValue: primary.value,
      sources: [primary.source],
    };
  }

  if (!parameter || parameter.value <= 0) return null;

  return {
    value: parameter.value,
    rawValue: parameter.value,
    sources: [parameter.source, sensitivityType.source],
  };
}

/** Resolves only a photographic sensitivity value whose EXIF/XMP meaning is clear. */
export function resolvePhotographicIso(
  fields: readonly MetadataField[],
): ResolvedPhotographicIso | null {
  return (
    resolveSourceGroup(fields, 'exif') ?? resolveSourceGroup(fields, 'xmp')
  );
}
