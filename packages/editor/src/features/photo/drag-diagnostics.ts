/** Opt-in production diagnostics. No controller is installed in ordinary builds. */
export const dragDiagnosticsEnabled =
  import.meta.env.VITE_DRAG_DIAGNOSTICS === '1';
const previewMode =
  typeof location === 'undefined'
    ? null
    : new URLSearchParams(location.search).get('dragPreview');
/** Local web/desktop development opens the PoC directly for user review. */
export const liveDragPreview =
  (import.meta.env.DEV &&
    previewMode !== 'full' &&
    previewMode !== 'simplified') ||
  (dragDiagnosticsEnabled && previewMode === 'poc');
export const fullDragPreview =
  liveDragPreview ||
  ((dragDiagnosticsEnabled || import.meta.env.DEV) && previewMode === 'full');

type Sample = { name: string; at: number; duration?: number; detail?: unknown };
const samples: Sample[] = [];
let recording = false;
let frame = 0;
let observer: PerformanceObserver | undefined;

export function dragSample(name: string, duration?: number, detail?: unknown) {
  if (dragDiagnosticsEnabled && recording)
    samples.push({ name, at: performance.now(), duration, detail });
}
export function dragTimer(name: string) {
  const start = dragDiagnosticsEnabled ? performance.now() : 0;
  return () => dragSample(name, performance.now() - start);
}

if (dragDiagnosticsEnabled) {
  const controller = {
    mode: liveDragPreview ? 'poc' : fullDragPreview ? 'full' : 'simplified',
    start() {
      controller.stop();
      samples.length = 0;
      recording = true;
      if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
        observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries())
            samples.push({
              name: 'longtask',
              at: entry.startTime,
              duration: entry.duration,
            });
        });
        observer.observe({ type: 'longtask' });
      }
      const tick = () => {
        dragSample('raf');
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    },
    stop() {
      recording = false;
      cancelAnimationFrame(frame);
      if (observer) {
        for (const entry of observer.takeRecords())
          samples.push({
            name: 'longtask',
            at: entry.startTime,
            duration: entry.duration,
          });
        observer.disconnect();
        observer = undefined;
      }
      return samples.slice();
    },
  };
  Object.assign(window, { __frameNoteDragDiagnostics: controller });
}
