import { normalizeMetadata } from './metadata';
import { extractXmpEvidence, type XmlParser } from './xmp-evidence';
import type {
  MetadataCandidate,
  MetadataField,
} from '../../../../core/src/metadata';

type ReaderGroups = Record<string, unknown>;

function xmpPacket(groups: ReaderGroups): string | null {
  const xmp = groups['xmp'];
  if (!xmp || typeof xmp !== 'object') return null;
  const raw = (xmp as Record<string, unknown>)['_raw'];
  return typeof raw === 'string' ? raw : null;
}

export async function extractMetadata(
  bytes: ArrayBuffer,
  parser?: XmlParser,
): Promise<MetadataField[]> {
  const domParser =
    parser ??
    (typeof globalThis.DOMParser === 'undefined'
      ? undefined
      : new globalThis.DOMParser());
  const { default: ExifReader } = await import('exifreader');
  const tags = (await ExifReader.load(bytes, {
    expanded: true,
    async: true,
    ...(domParser ? { domParser } : {}),
  })) as ReaderGroups;
  const rawPacket = xmpPacket(tags);
  const candidates: readonly MetadataCandidate[] =
    rawPacket && domParser ? extractXmpEvidence(rawPacket, domParser) : [];
  return normalizeMetadata(tags, candidates);
}
