import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createCaptionLayout } from '../caption-layout';
import { createPreset } from '../presets';
import { readPreset } from '../../../../scripts/preset-node';

describe('first official preset format', () => {
  it('reads the frozen v1 fixture independently of current defaults', () => {
    const source = readFileSync('tests/fixtures/presets/v1.json', 'utf8');
    const value = readPreset(source);
    expect(value.version).toBe(1);
    expect(value.layout.containers[0]!.template).toBe(
      '{author}\n{image:signature:2:font:original}',
    );
    expect(value.layout.containers[0]!.images![0]!.width).toBe(2);
    expect(readPreset(JSON.stringify(value))).toEqual(value);
  });
  const preset = () =>
    createPreset('preset-1', 'Test', createCaptionLayout(), []);
  it('writes and reads v1 without conversion', () => {
    const value = preset();
    expect(value.version).toBe(1);
    const parsed = readPreset(JSON.stringify(value));
    expect(parsed).toEqual(value);
    expect(
      JSON.stringify(
        createPreset(parsed.id, parsed.name, parsed.layout, parsed.icons),
      ),
    ).toBe(JSON.stringify(parsed));
  });
  it('rejects unknown versions and fields without silently dropping data', () => {
    expect(() =>
      readPreset(JSON.stringify({ ...preset(), version: 2 })),
    ).toThrow('newer');
    expect(() =>
      readPreset(JSON.stringify({ ...preset(), version: 0 })),
    ).toThrow('Invalid');
    expect(() =>
      readPreset(JSON.stringify({ ...preset(), unknown: true })),
    ).toThrow('Invalid');
    expect(() =>
      readPreset(JSON.stringify({ ...preset(), version: undefined })),
    ).toThrow('Invalid');
  });
  it('rejects malformed and unsafe embedded assets', () => {
    const value = preset();
    value.layout.containers[0]!.images = [
      {
        id: 'svg',
        name: 'Art',
        format: 'svg',
        source: '<svg viewBox="0 0 1 1"><script/></svg>',
        width: 1,
        height: 1,
      },
    ];
    expect(() => readPreset(JSON.stringify(value))).toThrow('Unsupported SVG');
    value.layout.containers[0]!.images![0]!.source =
      '<svg viewBox="0 0 2 1"><path d="M0 0h2v1H0z"/></svg>';
    const parsed = readPreset(JSON.stringify(value));
    expect(parsed.layout.containers[0]!.images![0]!.width).toBe(2);
    expect(readPreset(JSON.stringify(parsed))).toEqual(parsed);
  });
  it('rejects duplicate IDs and invalid PNG content', () => {
    const value = preset();
    value.layout.containers.push(value.layout.containers[0]!);
    expect(() => readPreset(JSON.stringify(value))).toThrow();
    value.layout.containers.pop();
    value.layout.containers[0]!.images = [
      {
        id: 'png',
        name: 'Art',
        format: 'png',
        source: 'data:image/png;base64,AAAA',
        width: 1,
        height: 1,
      },
    ];
    expect(() => readPreset(JSON.stringify(value))).toThrow('PNG');
  });
});
