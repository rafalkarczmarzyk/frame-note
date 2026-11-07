// Manual production benchmark, separate from the six visual regression scenes.
import { chromium, expect } from '@playwright/test';
import { build, preview } from 'vite';
import { mkdir, writeFile, rename, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { cpus, platform, release, totalmem } from 'node:os';
import { execFileSync } from 'node:child_process';
import { resolve, relative, isAbsolute } from 'node:path';
import { sceneNames, scenePreset } from './drag-benchmark/scenes.mjs';
import { summarize } from './drag-benchmark/report.mjs';

const args = process.argv.slice(2);
const option = (name, fallback) =>
  args.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1] ?? fallback;
const scenes = option('scenes', sceneNames.join(',')).split(',');
const zooms = option('zooms', 'fit,100').split(',');
const modes = option('modes', 'simplified,full').split(',');
const atEdge = option('at-edge', 'center');
if (!['center', 'top-left', 'bottom-right'].includes(atEdge))
  throw Error('Invalid corner.');
if (atEdge !== 'center' && !args.includes('--compare-only'))
  throw Error('--at-edge is a compare-only diagnostic.');
for (const mode of modes)
  if (!['simplified', 'full', 'poc'].includes(mode))
    throw Error(`Invalid mode: ${mode}`);
const repetitions = Number(option('repetitions', '3'));
const out = resolve(option('out', 'drag-benchmark-results/baseline'));
const inTestResults = relative(resolve('test-results'), out);
if (
  inTestResults === '' ||
  (!inTestResults.startsWith('..') && !isAbsolute(inTestResults))
)
  throw Error(
    'Use an output directory outside test-results: Playwright clears it.',
  );
if (!Number.isInteger(repetitions) || repetitions < 1)
  throw Error('Invalid repetition count.');
for (const scene of scenes) scenePreset(scene);
for (const zoom of zooms)
  if (!['fit', '100'].includes(zoom)) throw Error(`Invalid zoom: ${zoom}`);
if (args.includes('--compare-only') && !args.includes('--compare'))
  throw Error('--compare-only requires --compare.');
const fingerprint = createHash('sha256');
for (const file of [
  'live-preview-renderer.ts',
  'use-glass-preview.ts',
  'preview-raster-pool.ts',
  'background-render.ts',
  'tiled-background.ts',
  'compare-preview.ts',
  'render.ts',
]) {
  fingerprint.update(file);
  fingerprint.update(
    await readFile(`packages/editor/src/features/caption/${file}`),
  );
}
await mkdir(out, { recursive: true });
process.env.VITE_DRAG_DIAGNOSTICS = '1';
await build({ logLevel: 'warn' });
const server = await preview({
  preview: { host: '127.0.0.1', port: 4193, strictPort: true },
});
let browser;
try {
  browser = await chromium.launch({ headless: !args.includes('--headed') });
  const gpu = await (
    await browser.newBrowserCDPSession()
  ).send('SystemInfo.getInfo');
  const results = {
    metadata: {
      commit: execFileSync('git', ['rev-parse', 'HEAD'], {
        encoding: 'utf8',
      }).trim(),
      sourceFingerprint: fingerprint.digest('hex'),
      dirty: !!execFileSync('git', ['status', '--porcelain'], {
        encoding: 'utf8',
      }).trim(),
      system: `${platform()} ${release()}`,
      cpu: cpus()[0]?.model,
      cores: cpus().length,
      ramBytes: totalmem(),
      browser: browser.version(),
      headed: args.includes('--headed'),
      gpu: gpu.gpu,
      viewport: { width: 1440, height: 900 },
      path: args.includes('--edge') ? 'edge' : 'center',
      positionCase: atEdge,
      repeatPointer: args.includes('--repeat-pointer'),
      input: {
        steps: 120,
        nominalHz: 60,
        pacing: 'wall-clock deadlines; actual delivery may lag',
      },
      dpr: 1,
      fixture: 'tests/fixtures/20260520-IMG_3843.jpg',
      caveats: [
        'Web Chromium, not Electron desktop.',
        'rAF intervals are not presentation latency.',
        'scene timings include overlapping render/export preparation work; scene-assembly includes asynchronous waits.',
        'Playwright/CDP/trace overhead is included; compare variants under identical conditions.',
      ],
    },
    runs: [],
    comparisons: [],
  };
  for (const scene of scenes)
    for (const zoom of zooms)
      for (const mode of modes) {
        const context = await browser.newContext({
          viewport: results.metadata.viewport,
          deviceScaleFactor: 1,
          colorScheme: 'dark',
          reducedMotion: 'reduce',
          recordVideo: { dir: `${out}/video`, size: results.metadata.viewport },
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (error) => errors.push(String(error)));
        await page.goto(`http://127.0.0.1:4193/?dragPreview=${mode}`);
        await page
          .getByLabel('Choose JPG or PNG photo')
          .setInputFiles(results.metadata.fixture);
        await expect(
          page.getByRole('button', { name: 'Export JPG', exact: true }),
        ).toBeEnabled();
        const preset = scenePreset(scene);
        if (atEdge !== 'center') {
          const position = preset.layout.containers[0].position;
          const value = atEdge === 'top-left' ? 0 : 100;
          if (position.tiled?.enabled)
            position.tiled.offset = {
              x: value === 0 ? -100 : 100,
              y: value === 0 ? -100 : 100,
            };
          else position.custom = { x: value, y: value };
        }
        await page.getByLabel('Import preset file').setInputFiles({
          name: 'drag.json',
          mimeType: 'application/json',
          buffer: Buffer.from(JSON.stringify(preset)),
        });
        await expect(
          page.getByRole('textbox', { name: 'Caption', exact: true }),
        ).toHaveAttribute('data-template', 'FrameNote');
        if (zoom === '100')
          await page.getByRole('button', { name: '100%', exact: true }).click();
        await expect(
          page.getByRole('button', { name: 'Export JPG', exact: true }),
        ).toBeEnabled({ timeout: 120000 });
        await page.evaluate(() => document.fonts.ready);
        await page.mouse.move(0, 0);
        let comparison;
        if (mode === 'poc' && args.includes('--compare')) {
          const result = await page.evaluate(() =>
            window.__frameNoteComparePreview(),
          );
          comparison = result.metrics;
          results.comparisons.push({ scene, zoom, mode, metrics: comparison });
          for (const kind of ['reference', 'actual', 'diff'])
            await writeFile(
              `${out}/${scene}-${zoom}-${kind}.png`,
              Buffer.from(result[kind].split(',')[1], 'base64'),
            );
          console.log(
            `Compare ${scene}-${zoom}: ${comparison.differingOver2}/${comparison.pixels} pixels differ by >2, max=${comparison.maximum}`,
          );
        }
        // Cold load is recorded separately from the warmed drag samples.
        const cold = await page.evaluate(() =>
          performance.getEntriesByType('navigation').map((e) => e.toJSON()),
        );
        const viewport = page.locator('[data-photo-canvas]');
        for (
          let repetition = 0;
          repetition < (args.includes('--compare-only') ? 0 : repetitions);
          repetition++
        ) {
          const box = await viewport.boundingBox();
          if (!box) throw Error('Missing viewport.');
          const view = await viewport.evaluate((el) => ({
            x: Number(el.getAttribute('data-view-x')),
            y: Number(el.getAttribute('data-view-y')),
            scale: Number(el.getAttribute('data-view-scale')),
          }));
          // Center anchor: start at left portion of the moving text, avoiding the upper Glass hit target.
          const x =
            box.x +
            28 +
            view.x +
            (5964 * view.scale) / 2 -
            (scene === 'tiled' ? 0 : 55 * Math.min(1, view.scale / 0.16));
          const y = box.y + 28 + view.y + (3976 * view.scale) / 2;
          const prefix = `${scene}-${zoom}-${mode}-${repetition}`;
          const cdp = await context.newCDPSession(page);
          await cdp.send('Tracing.start', {
            categories: 'devtools.timeline,blink.user_timing,cc',
            transferMode: 'ReturnAsStream',
          });
          await page.evaluate(() => window.__frameNoteDragDiagnostics.start());
          await page.mouse.move(x, y);
          await page.mouse.down();
          // Real pointer events over ~2 seconds, not synchronous synthetic drag callbacks.
          const inputProbe = [];
          const inputStart = performance.now();
          for (let step = 1; step <= 120; step++) {
            await new Promise((done) =>
              setTimeout(
                done,
                Math.max(
                  0,
                  inputStart + (step * 1000) / 60 - performance.now(),
                ),
              ),
            );
            const delta =
              (args.includes('--edge') ? (5964 * view.scale) / 2 : 80) *
                Math.sin((step / 120) * Math.PI * 2) +
              (20 * step) / 120;
            await page.mouse.move(
              x + delta,
              y + 30 * Math.sin((step / 120) * Math.PI),
            );
            if (
              args.includes('--check-inputs') &&
              [30, 60, 90].includes(step)
            ) {
              const label = scene === 'tiled' ? 'Offset X' : 'X position';
              const value = await page
                .getByRole('spinbutton', {
                  name: label,
                  exact: true,
                  includeHidden: true,
                })
                .inputValue();
              inputProbe.push({ step, value });
            }
            if (args.includes('--repeat-pointer') && step % 20 === 0)
              await page.mouse.move(
                x + delta,
                y + 30 * Math.sin((step / 120) * Math.PI),
              );
          }
          if (
            args.includes('--check-inputs') &&
            new Set(inputProbe.map((p) => p.value)).size < 2
          )
            throw Error(
              'Position input did not change while the pointer was held down.',
            );
          await page.mouse.up();
          await expect(
            page.getByRole('button', { name: 'Export JPG', exact: true }),
          ).toBeEnabled({ timeout: 120000 });
          const samples = await page.evaluate(() =>
            window.__frameNoteDragDiagnostics.stop(),
          );
          const heap = await cdp.send('Runtime.getHeapUsage');
          const traceDone = new Promise((done) =>
            cdp.once('Tracing.tracingComplete', done),
          );
          await cdp.send('Tracing.end');
          const { stream } = await traceDone;
          let trace = '';
          for (;;) {
            const chunk = await cdp.send('IO.read', { handle: stream });
            trace += chunk.base64Encoded
              ? Buffer.from(chunk.data, 'base64').toString()
              : chunk.data;
            if (chunk.eof) break;
          }
          await cdp.send('IO.close', { handle: stream });
          await writeFile(`${out}/${prefix}.trace.json`, trace);
          await cdp.detach();
          await writeFile(
            `${out}/${prefix}.samples.json`,
            JSON.stringify(samples),
          );
          const summary = summarize(samples);
          results.runs.push({
            comparison,
            inputProbe,
            video: `video/${scene}-${zoom}-${mode}.webm`,
            scene,
            zoom,
            mode,
            repetition,
            view,
            cold,
            heap,
            errors: [...errors],
            summary,
            samples,
          });
          await writeFile(
            `${out}/results.json`,
            JSON.stringify(results, null, 2),
          );
          console.log(
            `${prefix}: rAF p95=${summary.rafIntervalsMs.p95?.toFixed(1)}ms; updates=${summary.counters['document-update'] ?? 0}; renders=${summary.counters['preview-request'] ?? 0}`,
          );
          if (summary.counters['document-update']) {
            await page
              .getByRole('button', { name: 'Undo', exact: true })
              .click();
            await expect(
              page.getByRole('button', { name: 'Export JPG', exact: true }),
            ).toBeEnabled({ timeout: 120000 });
          }
        }
        await writeFile(
          `${out}/results.json`,
          JSON.stringify(results, null, 2),
        );
        const video = page.video();
        await context.close();
        if (video)
          await rename(
            await video.path(),
            `${out}/video/${scene}-${zoom}-${mode}.webm`,
          );
      }
  console.log(`Results: ${out}/results.json`);
} finally {
  await browser?.close();
  await new Promise((done) => server.httpServer.close(done));
}
