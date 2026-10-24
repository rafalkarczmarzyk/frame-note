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
              y={run.y + (scene.lineHeight - scene.fontSize) / 2}
              width={run.width}
              height={scene.fontSize}
              image={tintedIcon(
                run.icon,
                images.get(run.icon.svg)!,
                scene.fontSize,
                color,
              )}
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
            fontStyle={caption.style.fontWeight === 700 ? 'bold' : 'normal'}
            lineHeight={caption.style.lineHeight}
            fill={color}
            wrap="none"
          />
        ),
      )}
    </>
  );
}
