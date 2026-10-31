import { readFile } from 'node:fs/promises';
export type GraphicFormat = 'svg' | 'png' | 'icon';
export async function graphicPreset(
  format: GraphicFormat,
  unit: 'font' | 'document',
  alignment: 'top' | 'center' | 'bottom',
  color = 'original',
  height = unit === 'font' ? 2 : 4,
) {
  const id = 'visual-graphic';
  const images =
    format === 'icon'
      ? []
      : [
          {
            id,
            name: format === 'svg' ? 'FrameNote.svg' : 'rt.png',
            format,
            source:
              format === 'svg'
                ? await readFile(
                    new URL(
                      '../../fixtures/logos/frame-note-logo.svg',
                      import.meta.url,
                    ),
                    'utf8',
                  )
                : `data:image/png;base64,${(await readFile(new URL('../../fixtures/logos/rt.png', import.meta.url))).toString('base64')}`,
            width: format === 'svg' ? 273 : 14524,
            height: format === 'svg' ? 63 : 1884,
          },
        ];
  const token =
    format === 'icon'
      ? `icon:camera:${height}:${unit}:${alignment}`
      : `image:${id}:${height}:${unit}:${color}:${alignment}`;
  return {
    version: 1,
    id: 'visual-graphics',
    name: 'Visual graphics',
    icons: [],
    layout: {
      sizingUnit: 'short-edge',
      margins: { top: 3, right: 3, bottom: 3, left: 3 },
      marginLinkMode: 'none',
      activeId: 'visual-layer',
      containers: [
        {
          id: 'visual-layer',
          template: `Photo {${token}}`,
          images,
          style: {
            fontFamily: 'Montserrat Variable',
            fontWeight: 400,
            fontSize: 2,
            color: 'porcelain',
            opacity: 1,
            lineHeight: 1.4,
            textAlign: 'left',
          },
          position: { anchor: 'bottom-left' },
        },
      ],
    },
  };
}
