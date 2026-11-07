export function distribution(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const percentile = (p) =>
    sorted.length ? sorted[Math.ceil(sorted.length * p) - 1] : null;
  return {
    count: sorted.length,
    p50: percentile(0.5),
    p95: percentile(0.95),
    p99: percentile(0.99),
  };
}
export function summarize(samples) {
  const start = samples.find((s) => s.name === 'drag-start')?.at;
  const end = samples.find((s) => s.name === 'drag-end')?.at;
  if (start === undefined || end === undefined)
    throw Error('The pointer did not complete a layer drag.');
  const active = samples.filter((s) => s.at >= start && s.at <= end);
  const frames = active.filter((s) => s.name === 'raf').map((s) => s.at);
  const counters = {};
  const timings = {};
  for (const s of active) {
    counters[s.name] = (counters[s.name] ?? 0) + 1;
    if (s.duration !== undefined) (timings[s.name] ??= []).push(s.duration);
  }
  return {
    durationMs: end - start,
    // These are callback intervals, not proof of presented-frame latency.
    rafIntervalsMs: distribution(frames.slice(1).map((t, i) => t - frames[i])),
    counters,
    timingsMs: Object.fromEntries(
      Object.entries(timings).map(([k, v]) => [k, distribution(v)]),
    ),
    presentedFrameLatency: 'not measured; inspect browser trace/video',
  };
}
