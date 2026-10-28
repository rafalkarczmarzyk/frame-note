import { parseIconToken } from '@/domain/inline-icon';
import { metadataTokenStatus } from './token-status';
import { Tooltip } from '@/components/ui/tooltip';
import { parseImageToken } from '@/domain/inline-image';
import { imageSource } from '../image-assets';
import { useContext } from 'react';
import { TokenContext } from './token-context';
import { svgUrl } from '../svg-icons';
import type { MouseEvent } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { Aperture, Camera, Tag, TriangleAlert } from 'lucide-react';

export function TokenView({
  node,
  selected: nodeSelected,
  editor,
  getPos,
}: NodeViewProps) {
  const {
    values,
    hasPhoto = true,
    icons,
    images,
    selectedImagePosition,
    imageFontPixels = 20,
    imageUnitPixels = 1,
  } = useContext(TokenContext);
  const token = String(node.attrs.token);
  const iconRef = parseIconToken(token);
  const imageRef = parseImageToken(token);
  const graphic =
    imageRef && images?.find((item) => item.id === imageRef.assetId);
  const selected = nodeSelected || selectedImagePosition === getPos();
  const imageHeight = imageRef
    ? imageRef.unit === 'font'
      ? imageRef.height
      : (imageRef.height * imageUnitPixels) / imageFontPixels
    : 1;
  const asset = icons?.find((item) => item.name === iconRef?.name);
  const icon = token.startsWith('icon:') || token.startsWith('image:');
  const Icon = iconRef?.name === 'aperture' ? Aperture : Camera;
  const missing = token.startsWith('image:')
    ? !graphic
    : icon
      ? icons
        ? !asset
        : !['aperture', 'camera'].includes(iconRef?.name ?? '')
      : hasPhoto && !values[token]?.trim();
  const status =
    icon || !hasPhoto ? undefined : metadataTokenStatus(token, values);
  return (
    <Tooltip
      selectionActive={!!selected}
      content={
        graphic
          ? graphic.name
          : missing
            ? `${icon ? (imageRef ? 'Missing image' : 'Missing icon') : status === 'absent' ? 'Tag not found in this photo' : 'No value returned for'} · {${token}}`
            : icon
              ? `{${token}}`
              : !hasPhoto
                ? 'Open a photo to preview this value'
                : values[token]
      }
    >
      <NodeViewWrapper
        as="span"
        contentEditable={false}
        data-drag-handle=""
        onClick={(event: MouseEvent<HTMLSpanElement>) => {
          if (event.shiftKey) return;
          const position = getPos();
          if (typeof position === 'number')
            editor.chain().focus().setNodeSelection(position).run();
        }}
        data-token={token}
        data-missing={missing || undefined}
        data-value-status={status}
        className={`caption-token relative inline-flex cursor-grab items-center gap-1.5 rounded px-2 py-1 align-middle text-content-primary control-neutral ${imageRef ? 'text-xl' : 'h-8 text-xs leading-none'} ${selected ? 'outline-2 outline-input-focus-ring' : ''}`}
      >
        {missing ? (
          <TriangleAlert
            aria-hidden="true"
            className={icon ? 'size-5' : 'size-3'}
          />
        ) : graphic &&
          imageRef?.colorMode === 'single' &&
          graphic.format === 'svg' ? (
          <span
            aria-label={graphic.name}
            role="img"
            className="inline-block bg-current"
            style={{
              height: `${Math.max(1, Math.min(3, imageHeight))}em`,
              width: `${(Math.max(1, Math.min(3, imageHeight)) * graphic.width) / graphic.height}em`,
              maskImage: `url("${imageSource(graphic)}")`,
              maskSize: '100% 100%',
              maskRepeat: 'no-repeat',
            }}
          />
        ) : graphic && imageRef ? (
          <img
            src={imageSource(graphic)}
            alt={graphic.name}
            draggable={false}
            style={{
              height: `${Math.max(1, Math.min(3, imageHeight))}em`,
              width: 'auto',
              maxWidth: 'none',
            }}
          />
        ) : asset ? (
          <span
            aria-hidden="true"
            className="inline-block h-5 bg-current"
            style={{
              width: `${20 * asset.aspect}px`,
              maskImage: `url("${svgUrl(asset.svg)}")`,
              maskSize: '100% 100%',
              maskRepeat: 'no-repeat',
            }}
          />
        ) : icon ? (
          <Icon aria-hidden="true" className="size-5" />
        ) : (
          <Tag aria-hidden="true" className="size-3" />
        )}
        {icon ? (
          <span className="sr-only">
            {missing
              ? imageRef
                ? 'Missing image: '
                : 'Missing icon: '
              : imageRef
                ? 'Image: '
                : 'Icon: '}
            {graphic?.name ?? (imageRef ? token : token.slice(5))}
          </span>
        ) : (
          <span>{token}</span>
        )}
        {missing && <span className="sr-only"> (missing)</span>}
      </NodeViewWrapper>
    </Tooltip>
  );
}
