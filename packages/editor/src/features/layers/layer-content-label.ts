import { parseSeparatorToken } from '../../../../core/src/inline-separator';
import { parseIconToken } from '../../../../core/src/inline-icon';
import type { CaptionContainer } from '../../../../core/src/caption-layout';
import { parseImageToken } from '../../../../core/src/inline-image';
import { templateInline } from '../caption/editor/template-document';

type Content = Pick<CaptionContainer, 'template' | 'images' | 'logo'>;

export function layerContentLabel(layer: Content) {
  if (layer.logo) return layer.logo.asset.name;
  return (
    templateInline(layer.template.replace(/\s+/gu, ' ').trim())
      .map((node) => {
        if (node.type === 'text') return node.text;
        const token = String(node.attrs?.token);
        if (parseSeparatorToken(token)) return 'Separator';
        if (token.startsWith('image:')) {
          const image = parseImageToken(token);
          return (
            layer.images?.find((asset) => asset.id === image?.assetId)?.name ??
            'Missing image'
          );
        }
        return parseIconToken(token)?.name ?? token;
      })
      .join(' ')
      .replace(/\s+/gu, ' ')
      .trim() || 'Empty layer'
  );
}

/** Stable summaries identify templates independently of the current photo values. */
export function layerSummary(layer: Content) {
  if (layer.logo) return layer.logo.asset.name;
  return (
    templateInline(layer.template.replace(/\s+/gu, ' ').trim())
      .map((node) =>
        node.type === 'text'
          ? node.text?.trim()
          : layerContentLabel({
              ...layer,
              template: `{${String(node.attrs?.token)}}`,
            }),
      )
      .filter(Boolean)
      .join(' · ') || 'Empty layer'
  );
}
