import { describe, expect, it } from 'vitest';
import {
  normalizeHex,
  resolveCaptionColor,
} from '../../../core/src/caption-colors';

describe('caption colors', () => {
  it('accepts pasted short and full HEX and expands to a stable value', () => {
    expect(normalizeHex(' #abc ')).toBe('#AABBCC');
    expect(normalizeHex('a1b2c3')).toBe('#A1B2C3');
  });
  it.each([
    '',
    '#12',
    '#abcd',
    '#12345678',
    'red',
    'var(--color-slate)',
    '#gggggg',
  ])('rejects incomplete or unsupported color %s', (value) => {
    expect(normalizeHex(value)).toBeNull();
  });
  it('uses custom HEX directly while preserving token-based captions', () => {
    expect(
      resolveCaptionColor('#abc', () => {
        throw new Error('Custom colors need no token lookup');
      }),
    ).toBe('#AABBCC');
    expect(
      resolveCaptionColor('porcelain', (name) =>
        name === 'porcelain' ? ' #fdfffc ' : '',
      ),
    ).toBe('#fdfffc');
  });
});
