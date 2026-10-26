import { Tooltip } from '@/components/ui/tooltip';
import { parseImageToken } from '@/domain/inline-image';
import { imageSource } from '../image-assets';
import { IconButton } from '@/components/ui/icon-button';
import { useContext } from 'react';
import { TokenContext } from './token-context';
import { svgUrl } from '../svg-icons';
import type { MouseEvent } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { Aperture, Camera, Tag, TriangleAlert, X } from 'lucide-react';

export function TokenView({
  node,
  selected: nodeSelected,
  editor,
  getPos,
  deleteNode,
}: NodeViewProps) {
  const {
    values,
    icons,
    images,
    selectedImagePosition,
    imageFontPixels = 20,
    imageUnitPixels = 1,
  } = useContext(TokenContext);
  const token = String(node.attrs.token);
  const imageRef = parseImageToken(token);
  const graphic =
    imageRef && images?.find((item) => item.id === imageRef.assetId);
  const selected =
    nodeSelected || (imageRef && selectedImagePosition === getPos());
  const imageHeight = imageRef
    ? imageRef.unit === 'font'
      ? imageRef.height
      : (imageRef.height * imageUnitPixels) / imageFontPixels
    : 1;
  const asset = icons?.find((item) => `icon:${item.name}` === token);
  const icon = token.startsWith('icon:') || token.startsWith('image:');
  const Icon = token === 'icon:aperture' ? Aperture : Camera;
  const missing = token.startsWith('image:')
    ? !graphic
    : icon
      ? icons
        ? !asset
        : !['icon:aperture', 'icon:camera'].includes(token)
      : !values[token]?.trim();
  return (
    <Tooltip
      selectionActive={!!selected}
      content={
        graphic
          ? graphic.name
          : missing
            ? `${icon ? (imageRef ? 'Missing image' : 'Missing icon') : 'No value found for'} · {${token}}`
            : `{${token}}${icon ? '' : ` · ${values[token]}`}`
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
        className={`caption-token relative inline-flex cursor-grab items-center rounded text-content-primary ${icon ? 'align-middle text-inherit' : 'control-neutral gap-1 px-1.5 py-0.5 align-baseline text-xs'} ${selected ? 'outline-2 outline-input-focus-ring' : ''} ${missing && !icon ? 'border border-dashed' : ''}`}
      >
        {missing ? (
          <TriangleAlert
            aria-hidden="true"
            className={icon ? 'size-[1em]' : 'size-3'}
          />
        ) : graphic &&
          imageRef?.colorMode === 'single' &&
          graphic.format === 'svg' ? (
          <span
            aria-label={graphic.name}
            role="img"
            className="inline-block bg-current"
            style={{
              height: `${imageHeight}em`,
              width: `${(imageHeight * graphic.width) / graphic.height}em`,
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
              height: `${imageHeight}em`,
              width: 'auto',
              maxWidth: 'none',
            }}
          />
        ) : asset ? (
          <span
            aria-hidden="true"
            className="inline-block h-[1em] bg-current"
            style={{
              width: `${asset.aspect}em`,
              maskImage: `url("${svgUrl(asset.svg)}")`,
              maskSize: '100% 100%',
              maskRepeat: 'no-repeat',
            }}
          />
        ) : icon ? (
          <Icon aria-hidden="true" className="size-[1em]" />
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
        {selected && (
          <IconButton
            label={
              graphic ? `Remove image ${graphic.name}` : `Remove {${token}}`
            }
            tooltip={
              graphic ? `Remove image · ${graphic.name}` : `Remove {${token}}`
            }
            draggable={false}
            className="absolute -top-2 -right-2 size-4 rounded-full border border-panel-border bg-panel-base text-content-primary [&_svg]:size-2.5"
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.stopPropagation();
              deleteNode();
              editor.commands.focus();
            }}
          >
            <X aria-hidden="true" />
          </IconButton>
        )}
      </NodeViewWrapper>
    </Tooltip>
  );
}
