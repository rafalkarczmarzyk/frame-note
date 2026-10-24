import type { JSONContent } from '@tiptap/core';

/** Keep unknown tokens intact so templates remain portable between photos. */
export function templateInline(text: string): JSONContent[] {
  const content: JSONContent[] = [];
  let offset = 0;
  for (const match of text.matchAll(/\{([^{}\s]+)\}/gu)) {
    if (match.index > offset)
      content.push({ type: 'text', text: text.slice(offset, match.index) });
    content.push({ type: 'captionToken', attrs: { token: match[1] } });
    offset = match.index + match[0].length;
  }
  if (offset < text.length)
    content.push({ type: 'text', text: text.slice(offset) });
  return content;
}

export function templateDocument(template: string): JSONContent {
  return {
    type: 'doc',
    content: template
      .replace(/\r\n?/gu, '\n')
      .split('\n')
      .map((line) => ({
        type: 'paragraph',
        content: templateInline(line),
      })),
  };
}

export function documentTemplate(node: JSONContent): string {
  if (node.type === 'text') return node.text ?? '';
  if (node.type === 'captionToken')
    return `{${String(node.attrs?.token ?? '')}}`;
  if (node.type === 'hardBreak') return '\n';
  return (node.content ?? [])
    .map((child, index) => {
      const separator =
        node.type === 'doc' && index > 0 && child.type === 'paragraph'
          ? '\n'
          : '';
      return separator + documentTemplate(child);
    })
    .join('');
}
