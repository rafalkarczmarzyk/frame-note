export const blendModes = [
  'normal',
  'multiply',
  'screen',
  'soft-light',
  'add',
] as const;
export type BlendMode = (typeof blendModes)[number];
export interface LayerBlending {
  mode: BlendMode;
  opacity: number;
}
export const createLayerBlending = (): LayerBlending => ({
  mode: 'normal',
  opacity: 1,
});
export function hasLayerBlending(caption: {
  blending?: LayerBlending;
  visible?: boolean;
}) {
  return (
    caption.visible !== false &&
    !!caption.blending &&
    (caption.blending.mode !== 'normal' || caption.blending.opacity !== 1)
  );
}
export function blendOperation(mode: BlendMode): GlobalCompositeOperation {
  return mode === 'normal' ? 'source-over' : mode === 'add' ? 'lighter' : mode;
}
