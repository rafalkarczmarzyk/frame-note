import { describe, expect, it } from 'vitest';
// @ts-expect-error Benchmark helpers are plain JavaScript.
import * as report from '../../../../scripts/drag-benchmark/report.mjs';
// @ts-expect-error Benchmark fixtures are plain JavaScript.
import * as scenes from '../../../../scripts/drag-benchmark/scenes.mjs';
const { summarize, distribution } = report;
const { sceneNames, scenePreset } = scenes;
import { parsePreset } from '../../../core/src/presets';

describe('manual drag benchmark', () => {
  it('excludes load/settling work from the drag summary and preserves raw timing meaning', () => {
    const report = summarize([
      { name: 'document-update', at: 1 },
      { name: 'drag-start', at: 10 },
      { name: 'raf', at: 15 },
      { name: 'raf', at: 35 },
      { name: 'document-update', at: 40 },
      { name: 'preview-render', at: 45, duration: 23 },
      { name: 'drag-end', at: 50 },
      { name: 'preview-render', at: 90, duration: 40 },
    ]);
    expect(report.counters['document-update']).toBe(1);
    expect(report.timingsMs['preview-render']).toEqual({
      count: 1,
      p50: 23,
      p95: 23,
      p99: 23,
    });
    expect(report.rafIntervalsMs.p95).toBe(20);
    expect(report.presentedFrameLatency).toContain('not measured');
    expect(distribution([]).p95).toBeNull();
  });
  it('rejects a run that missed the draggable layer instead of reporting a fast empty run', () => {
    expect(() => summarize([{ name: 'raf', at: 1 }])).toThrow(
      'did not complete',
    );
  });
  it('uses valid, independent preset v1 fixtures', () => {
    for (const scene of sceneNames) {
      const preset = scenePreset(scene);
      expect(() =>
        parsePreset(JSON.stringify(preset), () => {
          throw Error('Unexpected SVG in text-only fixture');
        }),
      ).not.toThrow();
      preset.layout.containers[0].template = 'mutated';
      expect(scenePreset(scene).layout.containers[0].template).toBe(
        'FrameNote',
      );
    }
  });
});
