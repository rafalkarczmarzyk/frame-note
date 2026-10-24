import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Fragment, Slice } from '@tiptap/pm/model';
import type { MetadataField } from '@/domain/metadata';
import { captionTags } from '@/domain/caption-tags';
import { CaptionToken } from './token-extension';
import { templateDocument, documentTemplate } from './template-document';
import { TokenContext } from './token-context';
import type { SvgIcon } from '../svg-icons';

export function CaptionEditor({
  value,
  fields,
  icons,
  onChange,
  onFocus,
  onBlur,
  onReady,
}: {
  value: string;
  fields: readonly MetadataField[];
  icons: readonly SvgIcon[];
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onReady: (editor: Editor | null) => void;
}) {
  const callbacks = useRef({ onChange, onFocus, onBlur, onReady });
  useEffect(() => {
    callbacks.current = { onChange, onFocus, onBlur, onReady };
  });
  const [composing, setComposing] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        codeBlock: false,
        horizontalRule: false,
        bold: false,
        italic: false,
        strike: false,
        code: false,
        link: false,
        underline: false,
      }),
      CaptionToken,
    ],
    content: templateDocument(value),
    onUpdate: ({ editor }) =>
      callbacks.current.onChange(documentTemplate(editor.getJSON())),
    onFocus: () => callbacks.current.onFocus(),
    onBlur: () => callbacks.current.onBlur(),
    editorProps: {
      attributes: (state) => ({
        'data-template': documentTemplate(state.doc.toJSON()),
        role: 'textbox',
        'aria-label': 'Caption',
        'aria-multiline': 'true',
        'aria-placeholder': 'Add text, a tag or an icon…',
        spellcheck: 'false',
        class:
          'control-field min-h-36 p-3 text-xs leading-7 whitespace-pre-wrap outline-none',
      }),
      clipboardTextSerializer: (slice) =>
        documentTemplate({ type: 'doc', content: slice.content.toJSON() }),
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData('text/plain');
        if (text === undefined) return false;
        event.preventDefault();
        const doc = view.state.schema.nodeFromJSON(templateDocument(text));
        view.dispatch(
          view.state.tr
            .replaceSelection(new Slice(Fragment.from(doc.content), 1, 1))
            .scrollIntoView(),
        );
        return true;
      },
    },
  });
  useEffect(() => {
    onReady(editor);
    return () => onReady(null);
  }, [editor, onReady]);
  useEffect(() => {
    if (editor && !composing && documentTemplate(editor.getJSON()) !== value)
      editor.commands.setContent(templateDocument(value), {
        emitUpdate: false,
      });
  }, [value, editor, composing]);
  const values = Object.fromEntries(
    [...captionTags(fields), ...fields].map((field) => [
      field.key,
      field.displayValue,
    ]),
  );
  return (
    <TokenContext.Provider value={{ values, icons }}>
      <div
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={() => setComposing(false)}
      >
        <div className="relative">
          <EditorContent editor={editor} />
          {!value.trim() && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-3 left-3 text-xs leading-7 text-content-muted"
            >
              Add text, a tag or an icon…
            </span>
          )}
        </div>
      </div>
    </TokenContext.Provider>
  );
}
