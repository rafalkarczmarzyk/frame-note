import { describe, expect, it } from 'vitest';
import { DOMParser } from '@xmldom/xmldom';
import { captionTags } from '../../../../core/src/caption-tags';
import { normalizeMetadata } from './metadata';
import { extractXmpEvidence } from './xmp-evidence';

const tiffNamespace = 'http://ns.adobe.com/tiff/1.0/';
const dcNamespace = 'http://purl.org/dc/elements/1.1/';
const parser = new DOMParser({
  onError: (level, message) => {
    if (level === 'error' || level === 'fatalError') throw new Error(message);
  },
});

function packet(attributes: string, properties: string) {
  return `<?xpacket begin=""?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" ${attributes}>${properties}</rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="w"?>`;
}

describe('XMP evidence', () => {
  it('resolves Model by namespace URI regardless of XML order', () => {
    const models = [
      ['Camera original', 'Unrelated model'],
      ['Unrelated model', 'Camera original'],
    ];

    for (const [cameraModel, unrelatedModel] of models) {
      const xml = packet(
        `xmlns:camera="${tiffNamespace}" xmlns:other="https://example.invalid/camera/"`,
        `<camera:Model>${cameraModel}</camera:Model><other:Model>${unrelatedModel}</other:Model>`,
      );
      const evidence = extractXmpEvidence(xml, parser);
      const metadata = normalizeMetadata(
        {
          xmp: {
            Model: { value: unrelatedModel, description: unrelatedModel },
          },
        },
        evidence,
      );

      expect(
        captionTags(metadata).find((tag) => tag.key === 'camera'),
      ).toMatchObject({
        displayValue: cameraModel,
        sources: ['xmp:tiff:Model'],
      });
    }
  });

  it('keeps attribute, sequence values and language alternatives', () => {
    const xml = packet(
      `xmlns:dc="${dcNamespace}" dc:rights="Attribute rights"`,
      `
      <dc:creator><rdf:Seq><rdf:li>First author</rdf:li><rdf:li>Second author</rdf:li></rdf:Seq></dc:creator>
      <dc:rights><rdf:Alt>
        <rdf:li xml:lang="en-US">English rights</rdf:li>
        <rdf:li xml:lang="x-default">Default rights</rdf:li>
      </rdf:Alt></dc:rights>
    `,
    );
    const evidence = extractXmpEvidence(xml, parser);

    expect(
      evidence.find((candidate) => candidate.name === 'creator'),
    ).toMatchObject({
      rawValue: ['First author', 'Second author'],
      displayValue: 'First author, Second author',
      source: 'xmp:dc:creator',
    });
    expect(
      evidence
        .filter((candidate) => candidate.name === 'rights')
        .map(({ displayValue, language }) => ({ displayValue, language })),
    ).toEqual([
      { displayValue: 'Attribute rights', language: undefined },
      { displayValue: 'English rights', language: 'en-US' },
      { displayValue: 'Default rights', language: 'x-default' },
    ]);
  });
});
