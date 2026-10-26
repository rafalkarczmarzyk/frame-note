import { canvasFontStyle } from '../../domain/font-style';
import { Text, Image as CanvasImage } from 'react-konva';
import type { Caption } from '@/domain/document';
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
        run.icon ? (
          images.get(run.icon.svg) && (
            <CanvasImage
              key={index}
              listening={false}
              x={run.x}
              y={
                run.y +
                (run.icon.image ? 0 : (scene.lineHeight - scene.fontSize) / 2)
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
