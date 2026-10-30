import { expect, it } from 'vitest';
import {
  activeImageAssets,
  checkImageRetention,
} from '../../../core/src/image-retention';
import {
  addCaption,
  createCaptionLayout,
} from '../../../core/src/caption-layout';
import { imageToken, type ImageAsset } from '../../../core/src/inline-image';
const asset: ImageAsset = {
  id: 'one',
  name: 'one.svg',
  format: 'svg',
  source: '<svg/>',
  width: 1,
  height: 1,
};
const token = `{${imageToken({ assetId: 'one', height: 2, unit: 'font', colorMode: 'original' })}}`;
it('new layers own no images while duplicates keep only referenced images', () => {
  const layout = createCaptionLayout();
  layout.containers[0]!.images = [asset, { ...asset, id: 'unused' }];
  layout.containers[0]!.template = token;
  expect(addCaption(layout, 'empty').containers[1]!.images).toEqual([]);
  expect(addCaption(layout, 'copy', true).containers[1]!.images).toEqual([
    asset,
  ]);
});
it('counts active references separately from retained undo resources', () => {
  const history = Array.from({ length: 150 }, (_, i) => ({
    ...asset,
    id: String(i),
  }));
  expect(() => checkImageRetention('', history)).not.toThrow();
  expect(activeImageAssets(token + token, [asset])).toEqual([asset]);
  expect(activeImageAssets('', [asset])).toEqual([]);
  expect(() =>
    checkImageRetention(
      '',
      Array.from({ length: 1001 }, () => asset),
    ),
  ).toThrow('undo history');
});

it('allows 100 distinct active image references and rejects the 101st', () => {
  const assets = Array.from({ length: 101 }, (_, index) => ({
    ...asset,
    id: `image-${index}`,
  }));
  const templateFor = (items: readonly ImageAsset[]) =>
    items
      .map(
        (item) =>
          `{${imageToken({ assetId: item.id, height: 2, unit: 'font', colorMode: 'original' })}}`,
      )
      .join(' ');

  expect(() =>
    checkImageRetention(templateFor(assets.slice(0, 100)), assets),
  ).not.toThrow();
  expect(() => checkImageRetention(templateFor(assets), assets)).toThrow(
    '100 active images',
  );
});
