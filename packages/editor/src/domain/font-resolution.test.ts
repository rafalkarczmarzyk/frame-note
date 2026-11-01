import { expect, it } from 'vitest';
import { resolvedFontFamily, isFontAvailable } from '../../../core/src/fonts';
import { createCaption } from '../../../core/src/document';

it('resolves unknown names to Montserrat without modifying the saved caption', () => {
  const caption = createCaption();
  caption.style.fontFamily = 'Unknown "Font" \\ Test';
  expect(isFontAvailable(caption.style.fontFamily)).toBe(false);
  expect(resolvedFontFamily(caption.style.fontFamily)).toBe(
    'Montserrat Variable',
  );
  // Font resolution itself does not require a Canvas context.
  expect(caption.style.fontFamily).toBe('Unknown "Font" \\ Test');
});
