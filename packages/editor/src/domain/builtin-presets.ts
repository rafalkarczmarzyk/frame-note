import { dateToken } from '../../../core/src/date-format';
import {
  dateStampColor,
  quartzDateGlowColor,
  digitalDateStampColor,
} from '../../../core/src/caption-colors';
import { type Anchor, type Caption } from '../../../core/src/document';
import { createCaptionLayout } from '../../../core/src/caption-layout';
import { createLayerBackground } from '../../../core/src/layer-background';
import { defaultTiledPosition } from '../../../core/src/tiled-watermark';
import { createPreset } from '../../../core/src/presets';
import { builtinIcons } from '../features/caption/builtin-icons';

export const defaultTemplate =
  '{author}\n{lens}\n{icon:shutter} {shutterDuration}   {icon:aperture} {aperture}   {icon:iso} {iso}';

function layer(
  template: string,
  anchor: Anchor,
  style: Partial<Caption['style']> = {},
) {
  const caption = createCaptionLayout().containers[0]!;
  return {
    ...caption,
    template,
    position: { anchor },
    style: { ...caption.style, ...style },
  };
}
function preset(id: string, name: string, layers: ReturnType<typeof layer>[]) {
  const layout = createCaptionLayout();
  layout.containers = layers.map((caption, index) => ({
    ...caption,
    id: `caption-${index + 1}`,
  }));
  layout.activeId = layout.containers[0]!.id;
  return createPreset(id, name, layout, [...builtinIcons]);
}
const details = () => layer(defaultTemplate, 'bottom-left');
const glass = layer('{author}\n{camera}\n{exposure}', 'bottom-left', {
  fontFamily: 'Inter',
  fontSize: 1.6,
});
glass.background = { ...createLayerBackground(), type: 'glass', opacity: 0.35 };
const proof = layer('PROOF\n{author}', 'center', {
  fontSize: 2.5,
  fontWeight: 700,
  textAlign: 'center',
});
const proofLayer = {
  ...proof,
  position: { ...proof.position, tiled: defaultTiledPosition() },
  blending: { mode: 'normal' as const, opacity: 0.22 },
};

/** Retain existing IDs for surviving presets; user-saved copies remain independent. */
export const builtinPresets = [
  preset('builtin-default', 'Photo Details', [details()]),
  preset('builtin-signature', 'Signature', [
    layer('{author}', 'bottom-right', {
      fontFamily: 'Cormorant Garamond',
      fontStyle: 'italic',
      fontSize: 2.5,
    }),
  ]),
  preset('builtin-macro', 'Focus Stack', [
    details(),
    layer('{icon:stack} {heliconStackSummary}', 'bottom-right', {
      color: 'caption-white',
    }),
  ]),
  preset('builtin-glass-caption', 'Glass Caption', [glass]),
  preset('builtin-proof-watermark', 'Proof Watermark', [proofLayer]),
  preset('builtin-quartz-date', 'Quartz Date', [
    {
      ...layer(`{${dateToken("'YY MM DD")}}`, 'bottom-right', {
        fontFamily: '7-Segment',
        fontWeight: 700,
        fontStyle: 'italic',
        fontSize: 2.5,
        color: dateStampColor,
      }),
      blending: { mode: 'add', opacity: 1 },
      effects: [
        {
          id: 'quartz-date-glow',
          type: 'glow',
          enabled: true,
          color: quartzDateGlowColor,
          opacity: 1,
          x: 0,
          y: 0,
          spread: 0,
          blur: 0.24,
        },
        {
          id: 'quartz-date-blur',
          type: 'blur',
          enabled: true,
          color: 'caption-black',
          opacity: 1,
          x: 0,
          y: 0,
          spread: 0,
          blur: 0.02,
        },
      ],
    },
  ]),
  preset('builtin-digital-date', 'Digital Date', [
    {
      ...layer(`{${dateToken('YYYY/MM/DD')}}`, 'bottom-right', {
        fontFamily: 'Oswald',
        fontWeight: 400,
        fontSize: 2.2,
        color: digitalDateStampColor,
      }),
      effects: [
        {
          id: 'digital-date-outline',
          type: 'outline',
          enabled: true,
          color: 'caption-black',
          opacity: 0.8,
          x: 0,
          y: 0,
          spread: 0.06,
          blur: 0,
        },
      ],
    },
  ]),
];
