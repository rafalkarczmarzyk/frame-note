import { describe, expect, it } from 'vitest';
import { metadataTokenStatus } from './token-status';

describe('metadata token status', () => {
  it('recognizes values including zero', () => {
    expect(metadataTokenStatus('exif:Rating', { 'exif:Rating': '0' })).toBe(
      'value',
    );
  });
  it('warns for helpers without source data', () => {
    expect(metadataTokenStatus('author', {})).toBe('empty');
    expect(metadataTokenStatus('heliconStack', {})).toBe('empty');
  });
  it('warns for present fields with empty or whitespace values', () => {
    expect(metadataTokenStatus('exif:Artist', { 'exif:Artist': '' })).toBe(
      'empty',
    );
    expect(metadataTokenStatus('exif:Artist', { 'exif:Artist': '  ' })).toBe(
      'empty',
    );
  });
  it('marks absent metadata and unknown helpers as absent', () => {
    expect(metadataTokenStatus('exif:Artist', {})).toBe('absent');
    expect(metadataTokenStatus('unknown', {})).toBe('absent');
  });
});
