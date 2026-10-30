export const sidebarWidth = { default: 384, min: 384, max: 560 };
export function clampSidebarWidth(value: number) {
  return Number.isFinite(value)
    ? Math.min(sidebarWidth.max, Math.max(sidebarWidth.min, value))
    : sidebarWidth.default;
}
