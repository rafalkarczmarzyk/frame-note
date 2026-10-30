import { expect, it } from 'vitest';
import { insertToken, usedTokens } from './insert-token';

it('inserts at the saved cursor instead of the end', () => {
  expect(
    insertToken('Hello world', 'exif:Artist', { start: 6, end: 6 }),
  ).toEqual({ template: 'Hello {exif:Artist}world', cursor: 19 });
});
it('replaces a saved selection and returns the new cursor', () => {
  expect(
    insertToken('Hello world', 'exif:Artist', { start: 6, end: 11 }),
  ).toEqual({ template: 'Hello {exif:Artist}', cursor: 19 });
});
it('clamps stale selection positions after edits', () => {
  expect(
    insertToken('Hi', 'exif:Artist', { start: 20, end: 30 }).template,
  ).toBe('Hi{exif:Artist}');
});
it('marks exact token identities and updates after removal', () => {
  expect([...usedTokens('{exif:Artist} {exif:Artist} {xmp:Artist}')]).toEqual([
    'exif:Artist',
    'xmp:Artist',
  ]);
  expect(usedTokens('Artist').has('exif:Artist')).toBe(false);
});
