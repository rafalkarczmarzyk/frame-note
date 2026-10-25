import { expect, it } from 'vitest';
import { inlineLayout } from './inline-layout';
import { resolveCaptionContent } from './inline-content';
import { createCaption } from '../../domain/document';
import {
  imageToken,
  migrateLogo,
  type ImageAsset,
} from '../../domain/inline-image';

const asset: ImageAsset = {
  id: 'mark',
  name: 'mark.svg',
  format: 'svg',
  source: '<svg/>',
  width: 4,
  height: 1,
};
it('measures image-only rows without font padding and keeps their settings independent', () => {
  const first = imageToken({
    assetId: 'mark',
    height: 2,
    unit: 'font',
    colorMode: 'original',
  });
  const second = imageToken({
    assetId: 'mark',
    height: 80,
    unit: 'document',
    colorMode: 'single',
  });
  const caption = {
    ...createCaption(),
    sizingUnit: 'px' as const,
    template: `{${first}}\n{${second}}`,
    images: [asset],
  };
  caption.style.fontSize = 20;
  const resolved = resolveCaptionContent(
    caption.template,
    [],
    [],
    caption.images,
  );
  const scene = inlineLayout(
    { width: 1000, height: 800 },
    caption,
    resolved.text,
    resolved.icons,
  );
  expect(scene.width).toBe(320);
  expect(scene.height).toBe(120);
  expect(scene.runs.map((run) => [run.y, run.height, run.original])).toEqual([
    [0, 40, true],
    [40, 80, false],
  ]);
});
it('keeps migrated standalone logo dimensions and anchored geometry', () => {
  const caption = migrateLogo({
    ...createCaption(),
    logo: {
      asset: { name: 'mark', svg: '<svg/>', aspect: 4 },
      width: 20,
      colorMode: 'original' as const,
    },
  });
  const dimensions = { width: 1000, height: 800 };
  const resolved = resolveCaptionContent(
    caption.template,
    [],
    [],
    caption.images,
  );
  const scene = inlineLayout(
    dimensions,
    caption,
    resolved.text,
    resolved.icons,
  );
  expect(scene.width).toBe(160);
  expect(scene.height).toBe(40);
  expect(scene.x).toBe(24);
  expect(scene.y).toBe(736);
});
