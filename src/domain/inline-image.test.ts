import { describe, expect, it } from 'vitest';
import { createCaption } from './document';
import { imageToken, parseImageToken, migrateLogo } from './inline-image';
import { convertSizing } from './sizing';
import { createCaptionLayout } from './caption-layout';
import { createPreset, parsePreset } from './presets';
import { validateImageAssets } from './image-validation';
import { readFileSync } from 'node:fs';
import { resolveCaptionContent } from '../features/caption/inline-content';

const png = readFileSync('tests/fixtures/logos/rt.png');
const asset = {
  id: 'tomato',
  name: 'rt.png',
  format: 'png' as const,
  source: `data:image/png;base64,${png.toString('base64')}`,
  width: 14524,
  height: 1884,
};
const ref = {
  assetId: asset.id,
  height: 2,
  unit: 'font' as const,
  colorMode: 'original' as const,
};
const validate = (name: string, svg: string) => ({ name, svg, aspect: 4 });

describe('inline images', () => {
  it('preserves independent occurrence sizes through serialization and resolution', () => {
    const second = { ...ref, height: 4 };
    const template = `{${imageToken(ref)}} author {${imageToken(second)}}`;
    const resolved = resolveCaptionContent(template, [], [], [asset]);
    expect(resolved.missing).toEqual([]);
    expect(resolved.icons.map((icon) => icon.image?.height)).toEqual([2, 4]);
    expect(parseImageToken(imageToken(second))).toEqual(second);
    expect(parseImageToken('image:tomato:Infinity:font:original')).toBeNull();
  });
  it('converts document-sized occurrences but leaves relative occurrences unchanged', () => {
    const fixed = { ...ref, unit: 'document' as const, height: 100 };
    const caption = {
      ...createCaption(),
      sizingUnit: 'px' as const,
      template: `{${imageToken(ref)}} {${imageToken(fixed)}}`,
    };
    const converted = convertSizing(caption, 'short-edge', {
      width: 2000,
      height: 1000,
    });
    expect(converted.template).toBe(
      `{${imageToken(ref)}} {${imageToken({ ...fixed, height: 10 })}}`,
    );
  });
  it('migrates a standalone SVG without changing image dimensions or position', () => {
    const caption = {
      ...createCaption(),
      logo: {
        asset: validate('logo', '<svg/>'),
        width: 20,
        colorMode: 'single' as const,
      },
    };
    const migrated = migrateLogo(caption);
    expect(migrated.logo).toBeUndefined();
    expect(parseImageToken(migrated.template.slice(1, -1))).toMatchObject({
      height: 5,
      unit: 'document',
      colorMode: 'single',
    });
    expect(migrated.position).toEqual(caption.position);
    const preset = createPreset('id', 'Old', createCaptionLayout(caption), []);
    expect(preset.version).toBe(2);
    expect(
      parsePreset(
        JSON.stringify({
          ...preset,
          version: 1,
          layout: createCaptionLayout(caption),
        }),
        validate,
      ).layout.containers[0]?.template,
    ).toBe(migrated.template);
  });
  it('validates PNG dimensions from bytes, round trips presets and drops unused assets', () => {
    const images = validateImageAssets([{ ...asset, width: 1 }], validate);
    expect(images[0]?.width).toBe(14524);
    const caption = {
      ...createCaption(),
      template: `{${imageToken(ref)}}`,
      images: [asset, { ...asset, id: 'unused' }],
    };
    const preset = createPreset('id', 'PNG', createCaptionLayout(caption), []);
    expect(preset.layout.containers[0]?.images).toHaveLength(1);
    expect(parsePreset(JSON.stringify(preset), validate)).toEqual(preset);
    expect(() =>
      validateImageAssets(
        [{ ...asset, source: 'data:image/png;base64,AA==' }],
        validate,
      ),
    ).toThrow();
    expect(() => validateImageAssets([asset, asset], validate)).toThrow();
  });
  it('keeps missing image references visible as warnings and omits empty lines', () => {
    const result = resolveCaptionContent(
      `{${imageToken(ref)}}\n\nhello`,
      [],
      [],
    );
    expect(result.missing).toEqual([imageToken(ref)]);
    expect(result.text).toBe('\nhello');
  });
});
