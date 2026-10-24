import type { MouseEvent } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { Aperture, Camera, Tag, TriangleAlert } from 'lucide-react';

const prototypeValues: Record<string, string> = {
  author: 'Alex Morgan',
  camera: 'Canon EOS R5',
  aperture: 'ƒ/8',
  'exif:Artist': 'Alex Morgan',
};

export function TokenView({ node, selected, editor, getPos }: NodeViewProps) {
  const token = String(node.attrs.token);
  const icon = token.startsWith('icon:');
  const Icon = token === 'icon:aperture' ? Aperture : Camera;
  const missing = icon
    ? !['icon:aperture', 'icon:camera'].includes(token)
    : !prototypeValues[token];
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
      className={`caption-token inline-flex cursor-grab items-center rounded text-content-primary ${icon ? 'align-middle text-inherit' : 'control-neutral gap-1 px-1.5 py-0.5 align-baseline text-xs'} ${selected ? 'outline-2 outline-input-focus-ring' : ''} ${missing && !icon ? 'border border-dashed' : ''}`}
      title={
        missing
          ? `Missing: {${token}}`
          : `{${token}}${icon ? '' : ` · ${prototypeValues[token]}`}`
      }
    >
      {missing ? (
        <TriangleAlert
          aria-hidden="true"
          className={icon ? 'size-[1em]' : 'size-3'}
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
    </NodeViewWrapper>
  );
}
