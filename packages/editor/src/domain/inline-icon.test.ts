import { expect, it } from 'vitest';
import { iconToken, parseIconToken } from '../../../core/src/inline-icon';
import { imageToken, parseImageToken } from '../../../core/src/inline-image';
import { createCaption } from '../../../core/src/document';
import { convertSizing } from '../../../core/src/sizing';
import { createPreset } from '../../../core/src/presets';
import { createCaptionLayout } from '../../../core/src/caption-layout';

it('reads legacy icons and round-trips independent size and alignment', () => {
  expect(parseIconToken('icon:camera')).toEqual({
    name: 'camera',
    height: 1,
    unit: 'font',
  });
  const ref = {
    name: 'camera',
    height: 2,
    unit: 'document' as const,
    alignment: 'bottom' as const,
  };
  expect(parseIconToken(iconToken(ref))).toEqual(ref);
  for (const token of [
    'icon:camera:0:font:top',
    'icon:camera:Infinity:font:top',
    'icon:camera:2:px:top',
    'icon:camera:2:font:wrong',
  ])
    expect(parseIconToken(token)).toBeNull();
});
it('round-trips image alignment without changing old token serialization', () => {
  const ref = {
    assetId: 'logo',
    height: 2,
    unit: 'font' as const,
    colorMode: 'single' as const,
  };
  expect(imageToken(ref)).toBe('image:logo:2:font:single');
  expect(parseImageToken(imageToken({ ...ref, alignment: 'top' }))).toEqual({
    ...ref,
    alignment: 'top',
  });
});
it('converts fixed icon heights with document units and retains alignment', () => {
  const caption = {
    ...createCaption(),
    sizingUnit: 'px' as const,
    template: '{icon:camera:20:document:bottom} {icon:camera:2:font:top}',
  };
  expect(
    convertSizing(caption, 'short-edge', { width: 1000, height: 800 }).template,
  ).toBe('{icon:camera:2.5:document:bottom} {icon:camera:2:font:top}');
});
it('retains configured icon artwork in presets', () => {
  const layout = createCaptionLayout();
  layout.containers[0]!.template = '{icon:camera:2:font:bottom}';
  const icon = { name: 'camera', svg: '<svg/>', aspect: 1 };
  const preset = createPreset('one', 'Test', layout, [icon]);
  expect(preset.icons).toContainEqual(icon);
});
