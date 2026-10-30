import { expect, it } from 'vitest';
import { inlineLayout } from './inline-layout';
import { resolveCaptionContent } from './inline-content';
import { createCaption } from '../../../../core/src/document';
import {
  imageToken,
  migrateLogo,
  type ImageAsset,
} from '../../../../core/src/inline-image';

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

it('Auto aligns rows containing artwork using the retained anchor', () => {
  const caption = createCaption();
  caption.position.anchor = 'bottom-right';
  const icons = [
    { name: 'wide', svg: '<svg/>', aspect: 4 },
    { name: 'small', svg: '<svg/>', aspect: 1 },
  ];
  const dimensions = { width: 1000, height: 800 };
  const scene = inlineLayout(
    dimensions,
    caption,
    '\uE0000\uE001\n\uE0001\uE001',
    icons,
  );
  expect(scene.runs[1]!.x + scene.runs[1]!.width).toBe(scene.width);
  caption.position.custom = { x: 80, y: 70 };
  expect(
    inlineLayout(dimensions, caption, '\uE0000\uE001\n\uE0001\uE001', icons)
      .runs,
  ).toEqual(scene.runs);
  caption.style.textAlign = 'left';
  expect(
    inlineLayout(dimensions, caption, '\uE0000\uE001\n\uE0001\uE001', icons)
      .runs[1]!.x,
  ).toBe(0);
});

it('aligns individually sized icons within the tallest row', () => {
  const icon = { name: 'camera', svg: '<svg/>', aspect: 1 };
  for (const [alignment, y] of [
    ['top', 0],
    ['center', 10],
    ['bottom', 20],
  ] as const) {
    const caption = {
      ...createCaption(),
      sizingUnit: 'px' as const,
      template: `{icon:camera:2:font:${alignment}}{icon:camera:1:font:${alignment}}`,
    };
    caption.style.fontSize = 20;
    const resolved = resolveCaptionContent(caption.template, [], [icon]);
    expect(resolved.missing).toEqual([]);
    const scene = inlineLayout(
      { width: 1000, height: 800 },
      caption,
      resolved.text,
      resolved.icons,
    );
    expect(scene.height).toBe(40);
    expect(scene.width).toBe(60);
    expect(scene.runs.map((run) => [run.y, run.height])).toEqual([
      [0, 40],
      [y, 20],
    ]);
  }
});

it('keeps the line height when configuring a default-sized icon', () => {
  const caption = { ...createCaption(), sizingUnit: 'px' as const };
  caption.style.fontSize = 20;
  const resolved = resolveCaptionContent(
    '{icon:camera:1:font:center}',
    [],
    [{ name: 'camera', svg: '<svg/>', aspect: 1 }],
  );
  const scene = inlineLayout(
    { width: 1000, height: 800 },
    caption,
    resolved.text,
    resolved.icons,
  );
  expect(scene.height).toBe(20 * caption.style.lineHeight);
  expect(scene.runs[0]!.y).toBe((scene.height - 20) / 2);
});

it('aligns the tallest graphic against the text line rather than always centering text', () => {
  const icon = { name: 'camera', svg: '<svg/>', aspect: 1 };
  for (const [alignment, textY] of [
    ['top', 0],
    ['center', 20],
    ['bottom', 40],
  ] as const) {
    const caption = { ...createCaption(), sizingUnit: 'px' as const };
    caption.style.fontSize = 20;
    caption.style.lineHeight = 1;
    // A legacy small icon occupies the same reference band as the text.
    const resolved = resolveCaptionContent(
      `{icon:camera}{icon:camera:3:font:${alignment}}`,
      [],
      [icon],
    );
    const scene = inlineLayout(
      { width: 1000, height: 800 },
      caption,
      resolved.text,
      resolved.icons,
    );
    expect(scene.runs[0]!.y).toBe(textY);
    expect(scene.runs[1]!.y).toBe(0);
    expect(scene.height).toBe(60);
  }
});
