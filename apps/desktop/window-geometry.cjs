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
function centeredBounds(area, width, height) {
  return {
    width,
    height,
    x: area.x + Math.floor((area.width - width) / 2),
    y: area.y + Math.floor((area.height - height) / 2),
  };
}

function startupWindowGeometry(saved, displays, primary, current, isMacOS) {
  const display = saved
    ? displays.find(({ id }) => id === saved.displayId) || primary
    : current;
  const area = display.workArea;
  const maxWidth = isMacOS
    ? Math.max(1, Math.floor(area.width * 0.85))
    : area.width;
  const maxHeight = isMacOS
    ? Math.max(1, Math.floor(area.height * 0.85))
    : area.height;
  const fallback = centeredBounds(
    area,
    Math.min(2240, maxWidth),
    Math.min(1560, maxHeight),
  );
  const bounds = restoreWindowGeometry(saved, displays, primary, fallback);
  if (bounds.width > maxWidth || bounds.height > maxHeight) {
    return {
      bounds: centeredBounds(
        area,
        Math.min(bounds.width, maxWidth),
        Math.min(bounds.height, maxHeight),
      ),
      maximized: false,
    };
  }
  return { bounds, maximized: !isMacOS && Boolean(saved?.maximized) };
}

module.exports = { restoreWindowGeometry, startupWindowGeometry };
