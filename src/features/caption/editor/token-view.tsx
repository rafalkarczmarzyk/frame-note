import { IconButton } from '@/components/ui/icon-button';
import { useContext } from 'react';
import { TokenContext } from './token-context';
import { svgUrl } from '../svg-icons';
import type { MouseEvent } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { Aperture, Camera, Tag, TriangleAlert, X } from 'lucide-react';

export function TokenView({
  node,
  selected,
  editor,
  getPos,
  deleteNode,
}: NodeViewProps) {
  const { values, icons } = useContext(TokenContext);
  const token = String(node.attrs.token);
  const asset = icons?.find((item) => `icon:${item.name}` === token);
  const icon = token.startsWith('icon:');
  const Icon = token === 'icon:aperture' ? Aperture : Camera;
  const missing = icon
    ? icons
      ? !asset
      : !['icon:aperture', 'icon:camera'].includes(token)
    : !values[token]?.trim();
  return (
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
      title={
        missing
          ? `Missing: {${token}}`
          : `{${token}}${icon ? '' : ` · ${values[token]}`}`
      }
    >
      {missing ? (
        <TriangleAlert
          aria-hidden="true"
          className={icon ? 'size-[1em]' : 'size-3'}
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
          {missing ? 'Missing icon: ' : 'Icon: '}
          {token.slice(5)}
        </span>
      ) : (
        <span>{token}</span>
      )}
      {missing && <span className="sr-only"> (missing)</span>}
      {selected && (
        <IconButton
          label={`Remove {${token}}`}
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
  );
}
