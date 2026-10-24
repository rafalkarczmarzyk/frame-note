import { resolveTemplate } from '../features/caption/template';
import { createMetadataField } from './metadata';
import { expect, it } from 'vitest';
import { parseHeliconComment } from './helicon';
import { captionTags } from './caption-tags';
import { builtinPresets, defaultTemplate } from './builtin-presets';

it('formats the original fixture and accepts whitespace and methods A/B/C', () => {
  expect(
    parseHeliconComment('Stacked from 15 images. Method=A (R=8,S=4)'),
  ).toBe('Focus stack · 15 images · Method A · R=8 · S=4');
  expect(
    parseHeliconComment(' Stacked from 1 image. Method = c ( R = 4, S = 2 ) '),
  ).toContain('1 image · Method C');
});
it('does not interpret unrelated or incomplete comments as Helicon', () => {
  for (const value of [
    '',
    'My stack of 15 images',
    'Stacked from 15 images.',
    'Stacked from 0 images. Method=A (R=8,S=4)',
    'Stacked from 15 images. Method=D (R=8,S=4)',
  ])
    expect(parseHeliconComment(value)).toBeNull();
  expect(
    captionTags([]).find((tag) => tag.key === 'heliconStack')?.displayValue,
  ).toBe('');
});
it('provides Default and Macro without changing the default caption', () => {
  expect(builtinPresets[0]!.layout.containers[0]!.template).toBe(
    defaultTemplate,
  );
  expect(
    builtinPresets.find((preset) => preset.id === 'builtin-macro')!.layout
      .containers,
  ).toHaveLength(2);
  expect(
    builtinPresets.find((preset) => preset.id === 'builtin-macro')!.layout
      .containers[1]!.template,
  ).toBe('{heliconStack}');
});

it('falls back to a recognized XMP comment and records its source', () => {
  const fields = [
    createMetadataField({
      group: 'exif',
      name: 'UserComment',
      displayValue: 'Unrelated comment',
      rawValue: null,
    }),
    createMetadataField({
      group: 'xmp',
      name: 'UserComment',
      displayValue: 'Stacked from 49 images. Method=B (R=8,S=4)',
      rawValue: null,
    }),
  ];
  expect(
    captionTags(fields).find((tag) => tag.key === 'heliconStack'),
  ).toMatchObject({
    sources: ['xmp:UserComment'],
    displayValue: 'Focus stack · 49 images · Method B · R=8 · S=4',
  });
});

it('resolves heliconStackCount as a bare number for custom text', () => {
  const fields = [
    createMetadataField({
      group: 'exif',
      name: 'UserComment',
      displayValue: 'Stacked from 15 images. Method=A (R=8,S=4)',
      rawValue: null,
    }),
  ];
  expect(
    captionTags(fields).find((tag) => tag.key === 'heliconStackCount'),
  ).toMatchObject({ displayValue: '15', sources: ['exif:UserComment'] });
  expect(
    resolveTemplate('Stacked {heliconStackCount} images', fields),
  ).toMatchObject({
    text: 'Stacked 15 images',
    missing: [],
    invalidSyntax: false,
  });
  expect(
    captionTags([]).find((tag) => tag.key === 'heliconStackCount')
      ?.displayValue,
  ).toBe('');
});
