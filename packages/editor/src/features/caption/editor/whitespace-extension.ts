import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const whitespaceKey = new PluginKey<boolean>('captionWhitespace');
export const CaptionWhitespace = Extension.create({
  name: 'captionWhitespace',
  addProseMirrorPlugins() {
    return [
      new Plugin<boolean>({
        key: whitespaceKey,
        state: {
          init: () => true,
          apply: (transaction, previous) =>
            transaction.getMeta(whitespaceKey) ?? previous,
        },
        props: {
          decorations(state) {
            if (!whitespaceKey.getState(state)) return null;
            const decorations: Decoration[] = [];
            const newline = (position: number) =>
              decorations.push(
                Decoration.widget(
                  position,
                  () => {
                    const marker = document.createElement('span');
                    marker.className = 'caption-whitespace-newline';
                    marker.setAttribute('aria-hidden', 'true');
                    marker.contentEditable = 'false';
                    const svg = document.createElementNS(
                      'http://www.w3.org/2000/svg',
                      'svg',
                    );
                    svg.setAttribute('viewBox', '0 0 24 24');
                    svg.setAttribute('fill', 'none');
                    svg.setAttribute('stroke', 'currentColor');
                    svg.setAttribute('stroke-width', '2.5');
                    svg.setAttribute('stroke-linecap', 'round');
                    svg.setAttribute('stroke-linejoin', 'round');
                    const path = document.createElementNS(
                      'http://www.w3.org/2000/svg',
                      'path',
                    );
                    path.setAttribute(
                      'd',
                      'M9 10 4 15l5 5M4 15h11a4 4 0 0 0 4-4V4',
                    );
                    svg.append(path);
                    marker.append(svg);
                    return marker;
                  },
                  { side: -1, ignoreSelection: true },
                ),
              );
            state.doc.descendants((node, position) => {
              if (node.isText) {
                for (const match of node.text!.matchAll(/ /gu)) {
                  const from = position + match.index;
                  decorations.push(
                    Decoration.inline(from, from + 1, {
                      class: 'caption-whitespace-space',
                    }),
                  );
                }
              }
              if (node.type.name === 'hardBreak') newline(position);
              if (
                node.type.name === 'paragraph' &&
                position + node.nodeSize < state.doc.content.size
              )
                newline(position + node.nodeSize - 1);
            });
            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
