import { createCaption, type Anchor, type Caption } from './document';
import { createCaptionLayout, addCaption } from './caption-layout';
import { createPreset } from './presets';
import { builtinIcons } from '../features/caption/builtin-icons';

export const defaultTemplate = '{author}\n{lens}\n{exposure}';
const defaultLayout = createCaptionLayout({
  ...createCaption(),
  template: defaultTemplate,
});
const darkLayout = structuredClone(defaultLayout);
darkLayout.containers.forEach((container) => {
  container.style.color = 'charcoal';
});
// Keep the original Macro ID and geometry; only its displayed name changes.
const stackLayout = addCaption(defaultLayout, 'helicon-stack');
stackLayout.containers[1]!.template = '{heliconStack}';
stackLayout.containers[1]!.style.textAlign = 'right';

function layoutFor(
  blocks: {
    template: string;
    anchor: Anchor;
    style?: Partial<Caption['style']>;
  }[],
) {
  const layout = createCaptionLayout();
  layout.containers = blocks.map(({ template, anchor, style }, index) => {
    const caption = createCaptionLayout().containers[0]!;
    return {
      ...caption,
      id: `caption-${index + 1}`,
      template,
      style: { ...caption.style, ...style },
      position: { anchor },
    };
  });
  layout.activeId = layout.containers[0]?.id ?? null;
  return layout;
}
const signature = layoutFor([
  { template: '{author}', anchor: 'bottom-right', style: { fontSize: 1.5 } },
]);
const compact = layoutFor([
  { template: '{exposure}', anchor: 'bottom-left', style: { fontSize: 1.6 } },
]);
const cameraLens = layoutFor([
  { template: '{author}', anchor: 'bottom-left', style: { fontSize: 1.6 } },
  {
    template: '{camera}\n{lens}\n{exposure}',
    anchor: 'bottom-right',
    style: { fontSize: 1.6 },
  },
]);
const iconLayout = layoutFor([
  {
    template:
      '{icon:shutter} {shutter}   {icon:aperture} {aperture}   {icon:iso} {iso}',
    anchor: 'bottom-left',
    style: { fontSize: 1.7 },
  },
]);
const astrophotography = layoutFor([
  { template: '{author}', anchor: 'bottom-left', style: { fontSize: 1.5 } },
  {
    template:
      '{camera}\n{lens}\n{focalLength}\n{shutterDuration} · {aperture} · {iso}',
    anchor: 'bottom-right',
    style: { fontSize: 1.5 },
  },
]);
const longExposure = layoutFor([
  { template: '{author}', anchor: 'bottom-left', style: { fontSize: 1.5 } },
  {
    template: '{shutterDuration} · {aperture} · {iso}',
    anchor: 'bottom-right',
    style: { fontSize: 1.6 },
  },
]);
export const builtinPresets = [
  createPreset('builtin-default', 'Default', defaultLayout, []),
  createPreset('builtin-default-dark', 'Default dark', darkLayout, []),
  createPreset('builtin-signature', 'Signature', signature, []),
  createPreset('builtin-compact-exif', 'Compact EXIF', compact, []),
  createPreset('builtin-camera-lens', 'Camera & Lens', cameraLens, []),
  createPreset('builtin-macro', 'Focus Stack', stackLayout, []),
  createPreset('builtin-exif-icons', 'EXIF Icons', iconLayout, [
    ...builtinIcons,
  ]),
  createPreset(
    'builtin-astrophotography',
    'Astrophotography',
    astrophotography,
    [],
  ),
  createPreset('builtin-long-exposure', 'Long Exposure', longExposure, []),
];
