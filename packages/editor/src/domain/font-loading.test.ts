import { afterEach, expect, it, vi } from 'vitest';
import { createCaption } from '../../../core/src/document';
import { resolvedFontFamily, isFontAvailable } from '../../../core/src/fonts';
import { ensureCaptionFont } from '../features/caption/font-loading';

afterEach(() => vi.unstubAllGlobals());
it('loads Montserrat directly for unknown names without changing the selection', async () => {
  const load = vi.fn().mockResolvedValue([{}]);
  vi.stubGlobal('document', { fonts: { load } });
  const style = { ...createCaption().style, fontFamily: 'Unknown "font"' };
  await ensureCaptionFont(style, 'Photo text');
  expect(load).toHaveBeenCalledWith(
    'normal 400 16px "Montserrat Variable"',
    'Photo text A',
  );
  expect(style.fontFamily).toBe('Unknown "font"');
});
it('uses an explicit shared fallback when a known face fails to load', async () => {
  const load = vi
    .fn()
    .mockRejectedValueOnce(Error('Font unavailable'))
    .mockResolvedValue([{}]);
  vi.stubGlobal('document', { fonts: { load } });
  const style = { ...createCaption().style, fontFamily: 'Lora' };
  await ensureCaptionFont(style);
  expect(load).toHaveBeenCalledTimes(2);
  expect(isFontAvailable('Lora')).toBe(false);
  expect(resolvedFontFamily('Lora')).toBe('Montserrat Variable');
  expect(style.fontFamily).toBe('Lora');
});
it('reports a failure of the final Montserrat fallback instead of exporting another font', async () => {
  vi.stubGlobal('document', { fonts: { load: vi.fn().mockResolvedValue([]) } });
  await expect(ensureCaptionFont(createCaption().style)).rejects.toThrow(
    'Montserrat',
  );
});
