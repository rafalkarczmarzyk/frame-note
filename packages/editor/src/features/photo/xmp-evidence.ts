import type { MetadataCandidate } from '../../../../core/src/metadata';

export interface XmlParser {
  parseFromString(source: string, mimeType: string): unknown;
}

interface XmlNode {
  nodeType: number;
  childNodes: ArrayLike<XmlNode>;
  textContent: string | null;
}

interface XmlAttribute {
  namespaceURI: string | null;
  localName: string | null;
  nodeName: string;
  value: string;
}

interface XmlElement extends XmlNode {
  namespaceURI: string | null;
  localName: string | null;
  nodeName: string;
  attributes: ArrayLike<XmlAttribute> & {
    item(index: number): XmlAttribute | null;
  };
  getAttributeNS(namespaceUri: string, localName: string): string | null;
}

interface XmlDocument {
  getElementsByTagName(name: string): ArrayLike<XmlElement>;
  getElementsByTagNameNS(
    namespaceUri: string,
    localName: string,
  ): ArrayLike<XmlElement>;
}

const rdfNamespace = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const xmlNamespace = 'http://www.w3.org/XML/1998/namespace';
const xmlnsNamespace = 'http://www.w3.org/2000/xmlns/';

const namespacePrefixes: Readonly<Record<string, string>> = {
  'http://ns.adobe.com/exif/1.0/': 'exif',
  'http://cipa.jp/exif/1.0/': 'exifEX',
  'http://ns.adobe.com/tiff/1.0/': 'tiff',
  'http://ns.adobe.com/exif/1.0/aux/': 'aux',
  'http://purl.org/dc/elements/1.1/': 'dc',
  'http://ns.adobe.com/photoshop/1.0/': 'photoshop',
  'http://ns.adobe.com/xap/1.0/rights/': 'xmpRights',
};

function elementChildren(node: XmlElement): XmlElement[] {
  return Array.from(node.childNodes).filter(
    (child): child is XmlElement => child.nodeType === 1,
  );
}

function textValue(node: XmlElement): string {
  return (node.textContent ?? '').trim();
}

function localName(node: XmlElement | XmlAttribute): string {
  return node.localName || node.nodeName.split(':').at(-1) || node.nodeName;
}

function sourceName(namespaceUri: string, name: string): string {
  const prefix = namespacePrefixes[namespaceUri];
  return prefix ? `xmp:${prefix}:${name}` : `xmp:{${namespaceUri}}${name}`;
}

function candidate(
  node: XmlElement | XmlAttribute,
  value: unknown,
  displayValue: string,
  propertyPath: string,
  language?: string,
): MetadataCandidate {
  const namespaceUri = node.namespaceURI ?? '';
  const name = localName(node);
  return {
    group: 'xmp',
    name,
    source: sourceName(namespaceUri, name),
    rawValue: value,
    displayValue,
    namespaceUri,
    propertyPath,
    ...(language ? { language } : {}),
  };
}

function propertyValues(
  property: XmlElement,
  propertyPath: string,
): MetadataCandidate[] {
  const values: MetadataCandidate[] = [];
  const list = elementChildren(property).find(
    (child) =>
      child.namespaceURI === rdfNamespace &&
      ['Seq', 'Bag', 'Alt'].includes(localName(child)),
  );

  if (list) {
    const items = elementChildren(list).filter(
      (child) =>
        child.namespaceURI === rdfNamespace && localName(child) === 'li',
    );
    if (localName(list) === 'Alt') {
      for (const item of items) {
        const text = textValue(item);
        const language = item.getAttributeNS(xmlNamespace, 'lang') || undefined;
        if (text)
          values.push(candidate(property, text, text, propertyPath, language));
      }
      return values;
    }

    const itemsText = items.map(textValue).filter(Boolean);
    if (itemsText.length)
      values.push(
        candidate(property, itemsText, itemsText.join(', '), propertyPath),
      );
    return values;
  }

  const text = textValue(property);
  if (text) values.push(candidate(property, text, text, propertyPath));
  return values;
}

/**
 * Reads XMP properties before ExifReader's flattened local-name view can hide
 * namespace collisions. Existing source tokens remain backed by ExifReader.
 */
export function extractXmpEvidence(
  rawPacket: string,
  parser: XmlParser,
): MetadataCandidate[] {
  if (!rawPacket.trim()) return [];

  const document = parser.parseFromString(
    rawPacket,
    'application/xml',
  ) as XmlDocument;
  if (document.getElementsByTagName('parsererror').length) return [];

  const descriptions = Array.from(
    document.getElementsByTagNameNS(rdfNamespace, 'Description'),
  );
  const candidates: MetadataCandidate[] = [];

  for (const description of descriptions) {
    for (let index = 0; index < description.attributes.length; index++) {
      const attribute = description.attributes.item(index);
      if (
        !attribute ||
        !attribute.namespaceURI ||
        attribute.namespaceURI === rdfNamespace ||
        attribute.namespaceURI === xmlnsNamespace
      )
        continue;
      const value = attribute.value.trim();
      if (value)
        candidates.push(
          candidate(
            attribute,
            value,
            value,
            `${attribute.namespaceURI}${localName(attribute)}`,
          ),
        );
    }

    for (const property of elementChildren(description)) {
      if (!property.namespaceURI || property.namespaceURI === rdfNamespace)
        continue;
      const propertyPath = `${property.namespaceURI}${localName(property)}`;
      candidates.push(...propertyValues(property, propertyPath));
    }
  }

  return candidates;
}
