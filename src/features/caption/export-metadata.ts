import type { MetadataField } from '@/domain/metadata';

export const metadataGroups = [
  {
    id: 'author',
    label: 'Author & copyright',
    description: 'Creator, copyright and credit',
  },
  {
    id: 'camera',
    label: 'Camera & exposure',
    description: 'Camera, lens, ISO, aperture and shutter speed',
  },
  { id: 'date', label: 'Date & time', description: 'Capture date and time' },
  {
    id: 'location',
    label: 'Location',
    description: 'GPS coordinates and place names',
  },
  {
    id: 'description',
    label: 'Descriptions & keywords',
    description: 'Title, description, keywords and comments',
  },
] as const;
export type MetadataGroup = (typeof metadataGroups)[number]['id'];
export interface ExportMetadataOptions {
  removeAll: boolean;
  groups: Record<MetadataGroup, boolean>;
}
export function defaultExportMetadata(): ExportMetadataOptions {
  return {
    removeAll: true,
    groups: {
      author: true,
      camera: false,
      date: false,
      location: false,
      description: false,
    },
  };
}
const namespaces = {
  dc: 'http://purl.org/dc/elements/1.1/',
  tiff: 'http://ns.adobe.com/tiff/1.0/',
  exif: 'http://ns.adobe.com/exif/1.0/',
  aux: 'http://ns.adobe.com/exif/1.0/aux/',
  photoshop: 'http://ns.adobe.com/photoshop/1.0/',
  Iptc4xmpCore: 'http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/',
} as const;
type Rule = {
  group: MetadataGroup;
  target: string;
  sources: string[];
  kind?: 'Seq' | 'Bag' | 'Alt' | 'rational' | 'date';
};
// Explicit allowlist. Unknown properties, thumbnails, MakerNotes, edit history,
// orientation and source dimensions never enter the output packet.
const rules: Rule[] = [
  {
    group: 'author',
    target: 'dc:creator',
    sources: ['xmp:creator', 'exif:Artist', 'iptc:By-line'],
    kind: 'Seq',
  },
  {
    group: 'author',
    target: 'dc:rights',
    sources: ['xmp:rights', 'exif:Copyright', 'iptc:Copyright Notice'],
    kind: 'Alt',
  },
  {
    group: 'author',
    target: 'photoshop:Credit',
    sources: ['xmp:Credit', 'iptc:Credit'],
  },
  { group: 'camera', target: 'tiff:Make', sources: ['xmp:Make', 'exif:Make'] },
  {
    group: 'camera',
    target: 'tiff:Model',
    sources: ['xmp:Model', 'exif:Model'],
  },
  {
    group: 'camera',
    target: 'aux:Lens',
    sources: ['xmp:Lens', 'exif:LensModel'],
  },
  {
    group: 'camera',
    target: 'exif:ISOSpeedRatings',
    sources: [
      'xmp:ISOSpeedRatings',
      'exif:ISOSpeedRatings',
      'exif:PhotographicSensitivity',
    ],
    kind: 'Seq',
  },
  {
    group: 'camera',
    target: 'exif:ExposureTime',
    sources: ['xmp:ExposureTime', 'exif:ExposureTime'],
    kind: 'rational',
  },
  {
    group: 'camera',
    target: 'exif:FNumber',
    sources: ['xmp:FNumber', 'exif:FNumber'],
    kind: 'rational',
  },
  {
    group: 'camera',
    target: 'exif:FocalLength',
    sources: ['xmp:FocalLength', 'exif:FocalLength'],
    kind: 'rational',
  },
  {
    group: 'date',
    target: 'exif:DateTimeOriginal',
    sources: ['xmp:DateTimeOriginal', 'exif:DateTimeOriginal'],
    kind: 'date',
  },
  {
    group: 'location',
    target: 'photoshop:City',
    sources: ['xmp:City', 'iptc:City'],
  },
  {
    group: 'location',
    target: 'photoshop:State',
    sources: ['xmp:State', 'iptc:Province/State'],
  },
  {
    group: 'location',
    target: 'photoshop:Country',
    sources: ['xmp:Country', 'iptc:Country/Primary Location Name'],
  },
  {
    group: 'location',
    target: 'Iptc4xmpCore:Location',
    sources: ['xmp:Location', 'iptc:Sub-location'],
  },
  {
    group: 'description',
    target: 'dc:title',
    sources: ['xmp:title', 'iptc:Object Name'],
    kind: 'Alt',
  },
  {
    group: 'description',
    target: 'dc:description',
    sources: [
      'xmp:description',
      'exif:ImageDescription',
      'iptc:Caption/Abstract',
    ],
    kind: 'Alt',
  },
  {
    group: 'description',
    target: 'dc:subject',
    sources: ['xmp:subject', 'iptc:Keywords'],
    kind: 'Bag',
  },
  {
    group: 'description',
    target: 'exif:UserComment',
    sources: ['xmp:UserComment', 'exif:UserComment'],
    kind: 'Alt',
  },
];
function escapeXml(value: string): string {
  return (
    value
      // XML 1.0 disallows these source control characters.
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/gu, '')
      .replace(
        /[<>&"']/gu,
        (character) =>
          ({
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            '"': '&quot;',
            "'": '&apos;',
          })[character]!,
      )
  );
}
function values(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(values);
  return typeof value === 'string' ||
    (typeof value === 'number' && Number.isFinite(value))
    ? [String(value)]
    : [];
}
function read(
  fields: readonly MetadataField[],
  key: string,
  target: string,
): unknown {
  const field = fields.find((item) => item.key === key);
  if (!field) return undefined;
  if (field.group === 'xmp') {
    const prefix = target.split(':')[0] as keyof typeof namespaces;
    // Namespace evidence avoids copying an unrelated custom property with the same name.
    return field.candidates?.find(
      (candidate) => candidate.namespaceUri === namespaces[prefix],
    )?.rawValue;
  }
  return key === 'exif:UserComment' ? field.displayValue : field.rawValue;
}
function property(rule: Rule, raw: unknown): string {
  let entries = values(raw).filter(Boolean);
  if (!entries.length) return '';
  if (rule.kind === 'rational') {
    if (Array.isArray(raw) && raw.length === 1) raw = raw[0];
    if (
      Array.isArray(raw) &&
      raw.length === 2 &&
      raw.every((n) => typeof n === 'number' && Number.isFinite(n)) &&
      raw[1] !== 0
    )
      entries = [`${raw[0]}/${raw[1]}`];
    else if (
      entries.length !== 1 ||
      !/^\d+(?:\.\d+|\/\d+)?$/u.test(entries[0]!)
    )
      return '';
  }
  if (rule.kind === 'date') {
    entries = [entries[0]!.replace(/^(\d{4}):(\d{2}):(\d{2}) /u, '$1-$2-$3T')];
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/u.test(entries[0]!)) return '';
  }
  const content =
    rule.kind === 'Seq' || rule.kind === 'Bag' || rule.kind === 'Alt'
      ? `<rdf:${rule.kind}>${(rule.kind === 'Alt' ? entries.slice(0, 1) : entries).map((entry) => `<rdf:li${rule.kind === 'Alt' ? ' xml:lang="x-default"' : ''}>${escapeXml(entry)}</rdf:li>`).join('')}</rdf:${rule.kind}>`
      : escapeXml(entries[0]!);
  return `<${rule.target}>${content}</${rule.target}>`;
}
function gps(
  fields: readonly MetadataField[],
  axis: 'Latitude' | 'Longitude',
): string {
  const xmp = read(fields, `xmp:GPS${axis}`, `exif:GPS${axis}`);
  const existing = values(xmp)[0];
  if (existing && /^\d+(?:,\d+(?:\.\d+)?){1,2}[NSEW]$/u.test(existing))
    return `<exif:GPS${axis}>${existing}</exif:GPS${axis}>`;
  const raw = fields.find((field) => field.key === `exif:GPS${axis}`)?.rawValue;
  const ref = values(
    fields.find((field) => field.key === `exif:GPS${axis}Ref`)?.rawValue,
  )[0];
  if (
    !Array.isArray(raw) ||
    raw.length !== 3 ||
    !(axis === 'Latitude' ? /^[NS]$/u : /^[EW]$/u).test(ref ?? '')
  )
    return '';
  const numbers = raw.map((part: unknown) =>
    Array.isArray(part) &&
    part.length === 2 &&
    typeof part[0] === 'number' &&
    typeof part[1] === 'number' &&
    part[1] !== 0
      ? part[0] / part[1]
      : typeof part === 'number'
        ? part
        : NaN,
  );
  if (numbers.some((n) => !Number.isFinite(n) || n < 0)) return '';
  return `<exif:GPS${axis}>${numbers[0]},${numbers[1]! + numbers[2]! / 60}${ref}</exif:GPS${axis}>`;
}
export function exportXmp(
  fields: readonly MetadataField[],
  options: ExportMetadataOptions,
): string {
  if (options.removeAll) return '';
  const content =
    rules
      .filter((rule) => options.groups[rule.group])
      .map((rule) => {
        for (const source of rule.sources) {
          const output = property(rule, read(fields, source, rule.target));
          if (output) return output;
        }
        return '';
      })
      .join('') +
    (options.groups.location
      ? gps(fields, 'Latitude') + gps(fields, 'Longitude')
      : '');
  if (!content) return '';
  return `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" ${Object.entries(
    namespaces,
  )
    .map(([prefix, uri]) => `xmlns:${prefix}="${uri}"`)
    .join(' ')}>${content}</rdf:Description></rdf:RDF></x:xmpmeta>`;
}
export async function addExportMetadata(
  blob: Blob,
  fields: readonly MetadataField[],
  options: ExportMetadataOptions,
): Promise<Blob> {
  const xml = exportXmp(fields, options);
  if (!xml) return blob;
  const packet = new TextEncoder().encode(
    `http://ns.adobe.com/xap/1.0/\0${xml}`,
  );
  if (packet.length + 2 > 65535)
    throw new Error(
      'Selected metadata exceeds the JPG metadata limit. Select fewer groups.',
    );
  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (bytes[0] !== 255 || bytes[1] !== 216)
    throw new Error('Could not attach metadata to this JPG.');
  // Keep the JFIF APP0 segment first when the browser encoder emits it.
  const offset =
    bytes[2] === 255 && bytes[3] === 224
      ? 4 + ((bytes[4]! << 8) | bytes[5]!)
      : 2;
  const length = packet.length + 2;
  return new Blob(
    [
      bytes.slice(0, offset),
      new Uint8Array([255, 225, length >> 8, length & 255]),
      packet,
      bytes.slice(offset),
    ],
    { type: 'image/jpeg' },
  );
}
