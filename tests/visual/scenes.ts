/** Explicit allowlist: only production compositions, never historical proposals. */
export const scenes = [
  ['UI-03', 'preset-default'],
  ['UI-04', 'preset-signature'],
  ['UI-05', 'preset-default-dark'],
  ['UI-05', 'preset-astrophotography'],
  ['UI-08', 'multiple-captions'],
  ['UI-12', 'mixed-images'],
  ['UI-17', 'color-layer-background'],
  ['UI-17', 'glass-layer-background'],
  ['UI-18', 'glass-portrait-background'],
  ['UI-20', 'margin-rulers'],
  ['UI-19', 'inline-icons'],
  ['UI-21', 'custom-position'],
] as const;
