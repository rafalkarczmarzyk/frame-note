import { describe, expect, it } from 'vitest';
import {
  documentTemplate,
  templateDocument,
  templateInline,
} from './template-document';

describe('editor template interchange', () => {
  it.each([
    '',
    '© {author} — {exif:Artist}',
    '{icon:aperture} {aperture}\n\n{missing}\n',
    '  spaces  {author}{camera} end ',
    'Unfinished {author and {} remain literal',
  ])('preserves text, tokens and whitespace: %j', (template) => {
    expect(documentTemplate(templateDocument(template))).toBe(template);
  });
  it('normalizes platform line endings', () => {
    expect(documentTemplate(templateDocument('a\r\nb\rc'))).toBe('a\nb\nc');
  });
  it('makes unknown tags and icons atomic without discarding them', () => {
    expect(templateInline('{unknown}{icon:unknown}')).toEqual([
      { type: 'captionToken', attrs: { token: 'unknown' } },
      { type: 'captionToken', attrs: { token: 'icon:unknown' } },
    ]);
  });
});
