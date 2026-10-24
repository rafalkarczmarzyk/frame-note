import { describe, expect, it } from 'vitest';
import {
  inlineRuns,
  resolveCaptionContent,
  iconMarker,
} from './inline-content';
const aperture = { name: 'aperture', svg: '<svg/>', aspect: 1 };
describe('inline caption content', () => {
  it('keeps icons and metadata in their original order across lines', () => {
    const result = resolveCaptionContent(
      '{icon:aperture} {exif:Artist}\nLiteral text',
      [
        {
          key: 'exif:Artist',
          group: 'exif',
          rawValue: 'Photographer',
          name: 'Artist',
          displayValue: 'Photographer',
        },
      ],
      [aperture],
    );
    expect(result.text).toBe(`${iconMarker(0)} Photographer\nLiteral text`);
    expect(result.icons).toEqual([aperture]);
    expect(inlineRuns(result.text.split('\n')[0]!)).toEqual([
      { icon: 0 },
      { text: ' Photographer' },
    ]);
  });
  it('reports missing SVGs without marking valid icon syntax invalid', () => {
    const result = resolveCaptionContent('{icon:missing} {author}', [], []);
    expect(result.missing).toEqual(['author', 'icon:missing']);
    expect(result.invalidSyntax).toBe(false);
    expect(result.text).toBe('');
  });
  it('preserves adjacent and repeated icons without inserting spaces', () => {
    const result = resolveCaptionContent(
      'A{icon:aperture}{icon:aperture}B',
      [],
      [aperture],
    );
    expect(inlineRuns(result.text)).toEqual([
      { text: 'A' },
      { icon: 0 },
      { icon: 1 },
      { text: 'B' },
    ]);
  });
});
