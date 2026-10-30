/** Find the actual scrolling ancestor, independent of the surrounding layout tags. */
export function scrollAncestor(
  element: HTMLElement | null,
): HTMLElement | null {
  for (
    let parent = element?.parentElement;
    parent;
    parent = parent.parentElement
  ) {
    if (
      /(auto|scroll)/u.test(getComputedStyle(parent).overflowY) &&
      parent.scrollHeight > parent.clientHeight
    )
      return parent;
  }
  return null;
}
export function edgeScrollSpeed(pointer: number, top: number, bottom: number) {
  if (bottom <= top) return 0;
  const edge = Math.min(40, (bottom - top) / 2);
  if (pointer < top + edge) return -12;
  if (pointer > bottom - edge) return 12;
  return 0;
}
