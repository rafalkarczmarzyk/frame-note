import type Konva from 'konva';

/** Read photo coordinates from the parent, outside the resettable drag group. */
export function tiledDragPoint(node: Konva.Node) {
  return node.getParent()?.getRelativePointerPosition() ?? null;
}
