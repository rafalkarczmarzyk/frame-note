import { resolvedColor } from './resolve-color';
import { canvasFontStyle } from '../../../../core/src/font-style';
import { Text, Rect, Image as CanvasImage } from 'react-konva';
import type { Caption } from '../../../../core/src/document';
import { inlineLayout, tintedIcon } from './inline-layout';
export function InlinePreview({
  scene,
  caption,
  color,
  images,
}: {
  scene: ReturnType<typeof inlineLayout>;
  caption: Caption;
  color: string;
  images: ReadonlyMap<string, HTMLImageElement>;
}) {
  return (
    <>
      {scene.runs.map((run, index) =>
        run.separator ? (
          <Rect
            key={index}
            listening={false}
            x={run.x}
            y={run.y + (run.height - (run.thickness ?? 0)) / 2}
            width={run.width}
            height={run.thickness}
            fill={resolvedColor(run.separator.color)}
            opacity={run.separator.opacity}
          />
        ) : run.icon ? (
          images.get(run.icon.svg) && (
            <CanvasImage
              key={index}
              listening={false}
              x={run.x}
              y={
                run.y +
                (run.icon.image || run.icon.sizing
                  ? 0
                  : (scene.lineHeight - scene.fontSize) / 2)
              }
              width={run.width}
              height={run.height}
              image={
                run.original
                  ? images.get(run.icon.svg)!
                  : tintedIcon(
                      run.icon,
                      images.get(run.icon.svg)!,
                      run.height,
                      color,
                    )
              }
            />
          )
        ) : (
          <Text
            key={index}
            listening={false}
            x={run.x}
            y={run.y}
            text={run.text}
            fontSize={scene.fontSize}
            fontFamily={caption.style.fontFamily}
            fontStyle={canvasFontStyle(caption)}
            lineHeight={caption.style.lineHeight}
            fill={color}
            wrap="none"
          />
        ),
      )}
    </>
  );
}
