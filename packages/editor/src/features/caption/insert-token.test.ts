import { expect, it } from 'vitest';
import { usedTokens } from './insert-token';
it('marks exact token identities and updates after removal', () => {
  expect([...usedTokens('{exif:Artist} {exif:Artist} {xmp:Artist}')]).toEqual([
    'exif:Artist',
    'xmp:Artist',
  ]);
  expect(usedTokens('Artist').has('exif:Artist')).toBe(false);
});
