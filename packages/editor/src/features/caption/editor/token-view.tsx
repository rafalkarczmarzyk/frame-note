import { parseSeparatorToken } from '../../../../../core/src/inline-separator';
import { Badge } from '@/components/ui/badge';
import { parseIconToken } from '../../../../../core/src/inline-icon';
import { NodeSelection } from '@tiptap/pm/state';
import { metadataTokenStatus } from './token-status';
import { Tooltip } from '@/components/ui/tooltip';
import { parseImageToken } from '../../../../../core/src/inline-image';
import { imageSource } from '../image-assets';
import { useContext } from 'react';
import { TokenContext } from './token-context';
import { svgUrl } from '../svg-icons';
import type { MouseEvent } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import {
  Aperture,
  Camera,
  Tag,
  TriangleAlert,
  SeparatorHorizontal,
} from 'lucide-react';

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
  } = useContext(TokenContext);
  const token = String(node.attrs.token);
  const separator = parseSeparatorToken(token);
  const iconRef = parseIconToken(token);
  const imageRef = parseImageToken(token);
  const graphic =
    imageRef && images?.find((item) => item.id === imageRef.assetId);
  const selected = nodeSelected || selectedImagePosition === getPos();
  const asset = icons?.find((item) => item.name === iconRef?.name);
  const icon = token.startsWith('icon:') || token.startsWith('image:');
  const Icon = iconRef?.name === 'aperture' ? Aperture : Camera;
  const missing = separator
    ? false
    : token.startsWith('image:')
      ? !graphic
      : icon
        ? icons
          ? !asset
          : !['aperture', 'camera'].includes(iconRef?.name ?? '')
        : hasPhoto && !values[token]?.trim();
  const status =
    separator || icon || !hasPhoto
      ? undefined
      : metadataTokenStatus(token, values);
  return (
    <Tooltip
      selectionActive={!!selected}
      content={
        separator
          ? 'Separator · Solid line'
          : graphic
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
      <Badge
        asChild
        size="token"
        tone={
          status === 'empty'
            ? 'warning'
            : status === 'absent'
              ? 'error'
              : 'neutral'
        }
      >
        <NodeViewWrapper
          as="span"
          contentEditable={false}
          data-drag-handle=""
          onClick={(event: MouseEvent<HTMLSpanElement>) => {
            if (event.shiftKey) return;
            const position = getPos();
            if (typeof position === 'number') {
              editor.chain().focus().setNodeSelection(position).run();
              requestAnimationFrame(() => {
                const selection = editor.state.selection;
                if (
                  selection instanceof NodeSelection &&
                  selection.from === position
                )
                  editor.view.dom.ownerDocument
                    .getSelection()
                    ?.removeAllRanges();
              });
            }
          }}
          data-token={token}
          data-missing={missing || undefined}
          data-value-status={status}
          className={`caption-token relative cursor-grab ${selected ? 'z-10 outline-2 outline-input-focus-ring' : ''}`}
        >
          {separator ? (
            <SeparatorHorizontal aria-label="Separator" className="h-5 w-10" />
          ) : missing ? (
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
                height: '1.25rem',
                width: `${Math.min((1.25 * graphic.width) / graphic.height, 8)}rem`,
                maskImage: `url("${imageSource(graphic)}")`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
              }}
            />
          ) : graphic && imageRef ? (
            <img
              src={imageSource(graphic)}
              alt={graphic.name}
              draggable={false}
              style={{
                height: '1.25rem',
                width: 'auto',
                maxWidth: '8rem',
                objectFit: 'contain',
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
          {separator ? (
            <span className="sr-only">Separator</span>
          ) : icon ? (
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
      </Badge>
    </Tooltip>
  );
}
