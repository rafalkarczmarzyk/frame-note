import { Tag, TriangleAlert } from 'lucide-react';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { CaptionContainer } from '@/domain/caption-layout';
import { parseImageToken } from '@/domain/inline-image';
import { templateInline } from '../caption/editor/template-document';
import { imageSource } from '../caption/image-assets';
import { svgUrl, type SvgIcon } from '../caption/svg-icons';

type Content = Pick<CaptionContainer, 'template' | 'images' | 'logo'>;

/** A passive, bounded summary. It never creates an editor or resolves tag text. */
export function LayerContentPreview({
  layer,
  values,
  icons = [],
}: {
  layer: Content;
  values: Readonly<Record<string, string>>;
  icons?: readonly SvgIcon[];
}) {
  const nodes = templateInline(layer.template.replace(/\s+/gu, ' ').trim());
  const imageClass =
    'inline-block h-[18px] max-w-14 align-middle object-contain';
  if (layer.logo)
    return (
      <span className="flex min-w-0 items-center gap-2">
        <img src={svgUrl(layer.logo.asset.svg)} alt="" className={imageClass} />
        <span className="truncate">{layer.logo.asset.name}</span>
      </span>
    );
  if (!nodes.length)
    return <span className="text-content-muted">Empty layer</span>;
  return (
    <PreviewFlow>
      {nodes.map((node, index) => {
        if (node.type === 'text')
          return node.text
            ?.trim()
            .split(/\s+/u)
            .filter(Boolean)
            .map((word, wordIndex) => (
              <span
                key={`${index}-${wordIndex}`}
                className="inline-flex h-6 max-w-full items-center"
              >
                <span className="truncate">{word}</span>
              </span>
            ));
        const token = String(node.attrs?.token);
        const image = parseImageToken(token);
        const graphic =
          image && layer.images?.find((asset) => asset.id === image.assetId);
        const icon = icons.find((asset) => `icon:${asset.name}` === token);
        const isGraphic =
          token.startsWith('image:') || token.startsWith('icon:');
        const missing = isGraphic ? !graphic && !icon : !values[token]?.trim();
        const name =
          graphic?.name ??
          icon?.name ??
          (token.startsWith('image:')
            ? 'Missing image'
            : token.replace(/^icon:/u, ''));
        return (
          <span
            key={index}
            className={`inline-flex h-6 max-w-full items-center gap-1 ${isGraphic ? '' : `control-neutral rounded px-1.5 ${missing ? 'border border-dashed' : ''}`}`}
            data-layer-token={token}
            data-missing={missing || undefined}
          >
            {missing ? (
              <TriangleAlert aria-hidden="true" className="size-3 shrink-0" />
            ) : graphic &&
              image?.colorMode === 'single' &&
              graphic.format === 'svg' ? (
              <span
                role="img"
                aria-label={name}
                className="inline-block h-[18px] max-w-14 bg-current"
                style={{
                  width: `${(18 * graphic.width) / graphic.height}px`,
                  maskImage: `url("${imageSource(graphic)}")`,
                  maskSize: 'contain',
                  maskPosition: 'center',
                  maskRepeat: 'no-repeat',
                }}
              />
            ) : graphic ? (
              <img
                src={imageSource(graphic)}
                alt={name}
                className={imageClass}
                draggable={false}
              />
            ) : icon ? (
              <span
                role="img"
                aria-label={name}
                className="inline-block h-4 max-w-14 bg-current"
                style={{
                  width: `${16 * icon.aspect}px`,
                  maskImage: `url("${svgUrl(icon.svg)}")`,
                  maskSize: 'contain',
                  maskPosition: 'center',
                  maskRepeat: 'no-repeat',
                }}
              />
            ) : (
              <Tag aria-hidden="true" className="size-3 shrink-0" />
            )}
            {(!isGraphic || missing || nodes.length === 1) && (
              <span className="truncate">{name}</span>
            )}
          </span>
        );
      })}
    </PreviewFlow>
  );
}

/** Two complete 24px rows, with a consistent 4px gap in both directions. */
function PreviewFlow({ children }: { children: ReactNode }) {
  const flow = useRef<HTMLSpanElement>(null);
  const [clipped, setClipped] = useState(false);
  useLayoutEffect(() => {
    const element = flow.current;
    if (!element) return;
    const measure = () =>
      setClipped(element.scrollHeight > element.clientHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [children]);
  return (
    <span className="relative block text-xs leading-6">
      <span
        ref={flow}
        className="flex max-h-[52px] flex-wrap content-start items-center gap-1 overflow-hidden pr-4"
      >
        {children}
      </span>
      {clipped && (
        <span className="absolute right-0 bottom-0 flex h-6 items-center text-content-secondary">
          …
        </span>
      )}
    </span>
  );
}
