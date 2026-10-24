import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Node, mergeAttributes, InputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TokenView } from './token-view';

export const CaptionToken = Node.create({
  name: 'captionToken',
  group: 'inline',
  inline: true,
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      token: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-token'),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-caption-token]' }];
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-caption-token': '',
        'data-token': node.attrs.token,
      }),
      `{${String(node.attrs.token)}}`,
    ];
  },
  renderText({ node }) {
    return `{${String(node.attrs.token)}}`;
  },
  addInputRules() {
    return [
      new InputRule({
        find: /\{([^{}\r\n]+)\}$/,
        handler: ({ state, range, match }) => {
          state.tr.replaceWith(
            range.from,
            range.to,
            this.type.create({ token: match[1] }),
          );
        },
      }),
    ];
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          decorations: (state) => {
            const { from, to, empty } = state.selection;
            if (empty) return null;
            const decorations: Decoration[] = [];
            state.doc.nodesBetween(from, to, (node, position) => {
              if (
                node.type.name === this.name &&
                position >= from &&
                position + node.nodeSize <= to
              )
                decorations.push(
                  Decoration.node(position, position + node.nodeSize, {
                    class: 'outline-2 outline-input-focus-ring rounded',
                  }),
                );
            });
            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(TokenView);
  },
});
