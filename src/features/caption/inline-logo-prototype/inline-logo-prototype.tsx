import { createContext, useContext, useRef, useState } from 'react';
import { NodeSelection } from '@tiptap/pm/state';
import { Node, mergeAttributes } from '@tiptap/core';
import {
  EditorContent,
  useEditor,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from '@tiptap/react';
import { X } from 'lucide-react';
import { IconButton } from '@/components/ui/icon-button';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import { NumberField } from '@/components/ui/number-field';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { InspectorSection } from '@/components/layout/inspector-section';
import { CaptionToken } from '../editor/token-extension';
import { templateDocument } from '../editor/template-document';
import pngUrl from '../../../../tests/fixtures/logos/rt.png';
import svgUrl from '../../../../tests/fixtures/logos/frame-note-logo.svg';

const SelectedImageContext = createContext<number | null>(null);

const sources = { svg: svgUrl, png: pngUrl };

function PrototypeLogoView({
  node,
  selected,
  editor,
  getPos,
  deleteNode,
}: NodeViewProps) {
  const inspectorPosition = useContext(SelectedImageContext);
  const highlighted =
    selected || (inspectorPosition !== null && inspectorPosition === getPos());
  const format = node.attrs.format === 'png' ? 'png' : 'svg';
  const label = `${format === 'svg' ? 'FrameNote logo' : 'Raster test graphic'} (${format.toUpperCase()})`;
  return (
    <NodeViewWrapper
      as="span"
      contentEditable={false}
      data-drag-handle=""
      className={`relative inline-flex align-middle ${highlighted ? 'outline-2 outline-input-focus-ring rounded' : ''}`}
      onClick={() => {
        const position = getPos();
        if (typeof position === 'number')
          editor.chain().focus().setNodeSelection(position).run();
      }}
    >
      <img
        src={sources[format]}
        alt={label}
        title={label}
        draggable={false}
        style={{
          height: `${Number(node.attrs.size)}${node.attrs.unit === 'px' ? 'px' : 'em'}`,
          width: 'auto',
          maxWidth: 'none',
        }}
      />
      {highlighted && (
        <IconButton
          label={`Remove ${label}`}
          draggable={false}
          className="absolute -top-2 -right-2 control-height min-w-10 rounded border border-panel-border bg-panel-base px-2 text-content-primary"
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

// Deliberately isolated from the production model until the interaction is reviewed.
const PrototypeLogo = Node.create({
  name: 'prototypeLogo',
  group: 'inline',
  inline: true,
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      format: { default: 'svg' },
      size: { default: 2 },
      unit: { default: 'em' },
    };
  },
  parseHTML() {
    return [{ tag: 'img[data-prototype-logo]' }];
  },
  renderHTML({ node, HTMLAttributes }) {
    const format = node.attrs.format === 'png' ? 'png' : 'svg';
    return [
      'img',
      mergeAttributes(HTMLAttributes, {
        'data-prototype-logo': '',
        src: sources[format],
        alt: `${format === 'svg' ? 'FrameNote logo' : 'Raster test graphic'} (${format.toUpperCase()})`,
        title: `${format === 'svg' ? 'FrameNote logo' : 'Raster test graphic'} (${format.toUpperCase()})`,
        style: `display:inline-block;vertical-align:middle;height:${Number(node.attrs.size)}${node.attrs.unit === 'px' ? 'px' : 'em'};width:auto;max-width:none`,
      }),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(PrototypeLogoView);
  },
  renderText({ node }) {
    return `{logo:sample-${String(node.attrs.format)}}`;
  },
});

export function InlineLogoPrototype({
  example = 'mixed',
  light = false,
  logoFormat = 'svg',
}: {
  example?: 'mixed' | 'between-tags' | 'own-line' | 'logo-only';
  light?: boolean;
  logoFormat?: 'svg' | 'png';
}) {
  const [, refresh] = useState(0);
  const selectedLogoPosition = useRef<number | null>(null);
  const editingLogoSettings = useRef(false);
  const [logoPosition, setLogoPosition] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState(20);
  const logo = {
    type: 'prototypeLogo',
    attrs: { format: logoFormat, size: 2, unit: 'em' },
  };
  const paragraph = templateDocument('{author} · {camera}').content![0]!;
  const content =
    example === 'logo-only'
      ? [{ type: 'paragraph', content: [logo] }]
      : example === 'own-line'
        ? [{ type: 'paragraph', content: [logo] }, paragraph]
        : [
            {
              type: 'paragraph',
              content:
                example === 'between-tags'
                  ? [
                      { type: 'captionToken', attrs: { token: 'author' } },
                      { type: 'text', text: ' ' },
                      logo,
                      { type: 'text', text: ' ' },
                      { type: 'captionToken', attrs: { token: 'camera' } },
                    ]
                  : [
                      logo,
                      { type: 'text', text: ' © ' },
                      ...paragraph.content!,
                    ],
            },
            ...templateDocument('{icon:camera} {camera}').content!,
          ];
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
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
      PrototypeLogo,
    ],
    content: { type: 'doc', content },
    onTransaction: ({ editor, transaction }) => {
      const selection = editor.state.selection;
      if (
        selection instanceof NodeSelection &&
        selection.node.type.name === 'prototypeLogo'
      ) {
        selectedLogoPosition.current = selection.from;
      } else if (editor.isFocused && !editingLogoSettings.current) {
        selectedLogoPosition.current = null;
      } else if (
        selectedLogoPosition.current !== null &&
        transaction.docChanged
      ) {
        const mapped = transaction.mapping.mapResult(
          selectedLogoPosition.current,
        );
        selectedLogoPosition.current =
          editor.state.doc.nodeAt(mapped.pos)?.type.name === 'prototypeLogo'
            ? mapped.pos
            : null;
      }
      setLogoPosition(selectedLogoPosition.current);
      refresh((value) => value + 1);
    },
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-label': 'Layer content prototype',
        'aria-multiline': 'true',
        class:
          'min-h-36 p-3 whitespace-pre-wrap outline-none [&_.ProseMirror-selectednode]:outline-none',
      },
    },
  });
  const logoNode =
    logoPosition === null ? null : editor?.state.doc.nodeAt(logoPosition);
  const attrs = logoNode?.type.name === 'prototypeLogo' ? logoNode.attrs : null;
  const insert = (format: 'svg' | 'png') =>
    editor
      ?.chain()
      .focus()
      .insertContent({
        type: 'prototypeLogo',
        attrs: { format, size: 2, unit: 'em' },
      })
      .run();
  return (
    <div className="max-w-xl rounded-xl border border-container-settings-border bg-container-settings-base text-content-primary">
      <h2 className="px-3 py-3 font-display text-xl">Layer</h2>
      <InspectorSection title="Content">
        <div
          className={
            light
              ? 'rounded bg-porcelain text-charcoal'
              : 'rounded bg-charcoal-dark text-porcelain'
          }
          style={{ fontSize, lineHeight: 1.4 }}
        >
          <SelectedImageContext.Provider value={logoPosition}>
            <EditorContent
              editor={editor}
              onPointerDown={() => {
                editingLogoSettings.current = false;
              }}
            />
          </SelectedImageContext.Provider>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .insertContent({
                  type: 'captionToken',
                  attrs: { token: 'author' },
                })
                .run()
            }
          >
            Tag
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .insertContent({
                  type: 'captionToken',
                  attrs: { token: 'icon:camera' },
                })
                .run()
            }
          >
            Icon
          </Button>
          <Button variant="outline" size="sm" onClick={() => insert('svg')}>
            Logo SVG
          </Button>
          <Button variant="outline" size="sm" onClick={() => insert('png')}>
            Logo PNG
          </Button>
        </div>
        {attrs && (
          <div
            className="mt-3 space-y-3 rounded-lg border border-container-settings-border bg-selected-element-base p-3"
            aria-label="Selected logo settings"
            onPointerDownCapture={() => {
              editingLogoSettings.current = true;
            }}
            onFocusCapture={() => {
              editingLogoSettings.current = true;
            }}
          >
            <p className="text-xs text-content-secondary">
              Selected logo · {String(attrs.format).toUpperCase()}
            </p>
            <SegmentedControl
              label="Logo sizing"
              value={String(attrs.unit)}
              onValueChange={(unit) =>
                editor
                  ?.chain()
                  .setNodeSelection(logoPosition!)
                  .updateAttributes('prototypeLogo', {
                    unit,
                    size:
                      unit === 'px'
                        ? Number(attrs.size) * fontSize
                        : Number(attrs.size) / fontSize,
                  })
                  .run()
              }
              options={[
                { value: 'em', label: 'Relative to font' },
                { value: 'px', label: 'Fixed height' },
              ]}
            />
            <NumberField
              label="Image height"
              step={attrs.unit === 'px' ? 1 : 0.1}
              value={Number(attrs.size)}
              min={attrs.unit === 'px' ? 1 : 0.25}
              max={attrs.unit === 'px' ? 500 : 20}
              unit={attrs.unit === 'px' ? 'px' : '×'}
              onValueChange={(size) =>
                editor
                  ?.chain()
                  .setNodeSelection(logoPosition!)
                  .updateAttributes('prototypeLogo', { size })
                  .run()
              }
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  editor
                    ?.chain()
                    .setNodeSelection(logoPosition!)
                    .updateAttributes('prototypeLogo', {
                      format: attrs.format === 'png' ? 'svg' : 'png',
                    })
                    .run()
                }
              >
                Replace with {attrs.format === 'png' ? 'SVG' : 'PNG'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  editor
                    ?.chain()
                    .setNodeSelection(logoPosition!)
                    .deleteSelection()
                    .run()
                }
              >
                Remove logo
              </Button>
            </div>
          </div>
        )}
      </InspectorSection>
      <InspectorSection title="Typography">
        <NumberField
          label="Font size"
          step={0.1}
          value={fontSize}
          min={10}
          max={48}
          unit="px"
          onValueChange={setFontSize}
        />
      </InspectorSection>
      <p className="px-3 pb-3 text-xs text-content-secondary">
        Interaction prototype · sample artwork only. Select a logo to edit its
        size. Undo / redo: ⌘Z / ⇧⌘Z. Photo placement, uploads and presets belong
        to the next stage.
      </p>
    </div>
  );
}
