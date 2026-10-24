import { useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Fragment, Slice } from '@tiptap/pm/model';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { HelperText } from '@/components/ui/helper-text';
import { CaptionToken } from '../editor/token-extension';
import {
  documentTemplate,
  templateDocument,
} from '../editor/template-document';

const initial =
  '© {author}\n{icon:aperture} {aperture} · {camera}\n{missing} {icon:missing}';
const tokens = [
  'author',
  'camera',
  'aperture',
  'icon:aperture',
  'icon:camera',
  'missing',
];

export function CaptionEditorPrototype() {
  const [template, setTemplate] = useState(initial);
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
    content: templateDocument(initial),
    onUpdate: ({ editor }) => setTemplate(documentTemplate(editor.getJSON())),
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-label': 'Visual caption editor',
        'aria-multiline': 'true',
        class:
          'control-field min-h-44 p-3 text-sm leading-8 whitespace-pre-wrap outline-none',
      },
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

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-5 rounded-xl bg-sidebar-base p-6 text-content-primary">
      <div>
        <h1 className="font-display text-2xl">Caption editor · prototype</h1>
        <p className="mt-2 text-sm text-content-secondary">
          Select, delete or drag tags and SVG icons alongside ordinary text.
        </p>
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Insert elements">
        {tokens.map((token) => (
          <Button
            key={token}
            variant="outline"
            size="sm"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .insertContent({ type: 'captionToken', attrs: { token } })
                .run()
            }
          >
            {token}
          </Button>
        ))}
      </div>
      <EditorContent editor={editor} />
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor?.chain().focus().undo().run()}
        >
          Undo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor?.chain().focus().redo().run()}
        >
          Redo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor?.commands.setContent(templateDocument(initial))}
        >
          Reset example
        </Button>
      </div>
      <HelperText>
        Copy or cut any selection and paste it below to inspect the plain text.
        Paste it back into the visual editor to restore the badges. Missing
        elements stay in the template.
      </HelperText>
      <label className="flex flex-col gap-2 text-sm">
        Clipboard playground
        <Textarea
          aria-label="Clipboard playground"
          placeholder="Paste copied content here, or type a template to copy back…"
          rows={3}
        />
      </label>
      <div className="flex flex-col gap-2 text-sm">
        <span>Current template</span>
        <pre
          aria-label="Current template"
          className="min-h-20 whitespace-pre-wrap break-words rounded-lg bg-input-base p-3 text-xs text-content-secondary"
        >
          {template || '(empty)'}
        </pre>
      </div>
      <HelperText>
        This isolated prototype uses sample metadata and two bundled SVG icons.
        Photo rendering, SVG uploads and presets belong to later stages.
      </HelperText>
    </section>
  );
}
