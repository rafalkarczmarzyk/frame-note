export type Size = { width: number; height: number };
export type View = { scale: number; x: number; y: number };
export const zoomLevels = [0.25, 0.33, 0.5, 0.67, 1, 1.5, 2, 3, 4, 8];
export const fitScale = (photo: Size, viewport: Size) =>
  Math.min(1, viewport.width / photo.width, viewport.height / photo.height);
export const minimumScale = (photo: Size, viewport: Size) =>
  Math.min(0.25, fitScale(photo, viewport));
/** Manual zoom uses whole percentage points; Fit keeps its exact scale. */
export const manualMinimumScale = (photo: Size, viewport: Size) =>
  Math.ceil(minimumScale(photo, viewport) * 100 - 1e-9) / 100;
export const roundManualScale = (scale: number, photo: Size, viewport: Size) =>
  Math.max(
    manualMinimumScale(photo, viewport),
    Math.min(8, Math.round(scale * 100 + 1e-9) / 100),
  );
export function constrainView(view: View, photo: Size, viewport: Size): View {
  const axis = (offset: number, image: number, available: number) =>
    image <= available
      ? (available - image) / 2
      : Math.max(available - image, Math.min(0, offset));
  return {
    scale: view.scale,
    x: axis(view.x, photo.width * view.scale, viewport.width),
    y: axis(view.y, photo.height * view.scale, viewport.height),
  };
}
export function zoomView(
  view: View,
  scale: number,
  photo: Size,
  viewport: Size,
  anchor = { x: viewport.width / 2, y: viewport.height / 2 },
): View {
  scale = Math.max(minimumScale(photo, viewport), Math.min(8, scale));
  return constrainView(
    {
      scale,
      x: anchor.x - ((anchor.x - view.x) / view.scale) * scale,
      y: anchor.y - ((anchor.y - view.y) / view.scale) * scale,
    },
    photo,
    viewport,
  );
}
export function visiblePhoto(view: View, photo: Size, viewport: Size) {
  const x = Math.max(0, -view.x / view.scale);
  const y = Math.max(0, -view.y / view.scale);
  return {
    x,
    y,
    width: Math.min(photo.width, (viewport.width - view.x) / view.scale) - x,
    height: Math.min(photo.height, (viewport.height - view.y) / view.scale) - y,
  };
}
