/** Restore inside the saved display, falling back to the primary work area. */
function restoreWindowGeometry(saved, displays, primary, fallback) {
  if (!saved) return fallback;
  const display =
    displays.find((display) => display.id === saved.displayId) || primary;
  const area = display.workArea;
  const width = Math.min(Math.max(800, saved.width), area.width);
  const height = Math.min(Math.max(600, saved.height), area.height);
  return {
    width,
    height,
    x: Math.max(area.x, Math.min(saved.x, area.x + area.width - width)),
    y: Math.max(area.y, Math.min(saved.y, area.y + area.height - height)),
  };
}
module.exports = { restoreWindowGeometry };
