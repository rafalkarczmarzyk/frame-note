import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('lets a component override conflicting Tailwind classes', () => {
    expect(cn('px-4 text-sm', false, 'px-6')).toBe('text-sm px-6');
  });
});
