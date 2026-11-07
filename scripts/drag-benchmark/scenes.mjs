const background = {
  type: 'glass',
  color: 'caption-dark-gray',
  opacity: 0.12,
  padding: { top: 0.8, right: 1.7, bottom: 0.8, left: 1.7 },
  paddingLinkMode: 'pairs',
  radius: 1.5,
  blur: 0.5,
  shadow: {
    enabled: false,
    color: 'caption-black',
    opacity: 0.35,
    blur: 1,
    spread: 0,
    x: 0,
    y: 0.5,
  },
};
const effects = ['outline', 'shadow', 'glow', 'blur'].map((type, index) => ({
  id: `effect-${index}`,
  type,
  enabled: true,
  color: 'caption-black',
  opacity: type === 'blur' ? 1 : 0.8,
  x: type === 'shadow' ? 0.2 : 0,
  y: type === 'shadow' ? 0.2 : 0,
  spread: type === 'outline' ? 0.12 : 0,
  blur: type === 'outline' ? 0 : type === 'blur' ? 0.2 : 0.6,
}));
const layer = {
  id: 'moving',
  template: 'FrameNote',
  style: {
    fontFamily: 'Montserrat Variable',
    fontWeight: 400,
    fontSize: 3,
    color: 'porcelain',
    opacity: 1,
    lineHeight: 1.4,
    textAlign: 'left',
  },
  position: { anchor: 'center', custom: { x: 50, y: 50 } },
};
export const sceneNames = [
  'plain',
  'effects',
  'glass-blend',
  'under-glass',
  'tiled',
];
export function scenePreset(name) {
  if (!sceneNames.includes(name)) throw Error(`Unknown scene: ${name}`);
  const moving = structuredClone(layer);
  if (name === 'effects' || name === 'tiled')
    moving.effects = structuredClone(effects);
  if (name === 'glass-blend' || name === 'tiled') {
    moving.background = structuredClone(background);
    moving.blending = { mode: 'screen', opacity: 0.8 };
  }
  if (name === 'tiled')
    moving.position.tiled = {
      enabled: true,
      pattern: 'staggered',
      angle: 30,
      spacing: 8,
      offset: { x: 0, y: 0 },
    };
  const containers = [moving];
  if (name === 'under-glass')
    containers.push({
      ...structuredClone(layer),
      id: 'upper',
      template: 'Glass',
      background: structuredClone(background),
      blending: { mode: 'screen', opacity: 0.8 },
      position: { anchor: 'center', custom: { x: 54, y: 50 } },
    });
  return {
    version: 1,
    id: `drag-${name}`,
    name: `Drag ${name}`,
    icons: [],
    layout: {
      sizingUnit: 'short-edge',
      margins: { top: 3, right: 3, bottom: 3, left: 3 },
      marginLinkMode: 'none',
      activeId: 'moving',
      containers,
    },
  };
}
