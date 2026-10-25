import type { ReactNode } from 'react';
import { ImagePlus } from 'lucide-react';
import { createId } from '@/lib/create-id';
import type { JSONContent } from '@tiptap/core';
import { validateImageAssets } from '@/domain/image-validation';
import { svgIcon } from '../svg-icons';
import { NodeSelection } from '@tiptap/pm/state';
import {
  imageToken,
  parseImageToken,
  type ImageAsset,
} from '@/domain/inline-image';
import { importImage } from '../image-assets';
import { Button } from '@/components/ui/button';
import { NumberField } from '@/components/ui/number-field';
import { SegmentedControl } from '@/components/ui/segmented-control';
import {
  toPixels,
  pixelsPerUnit,
  sizingLabels,
  type SizingUnit,
} from '@/domain/sizing';
import type { ImageDimensions } from '@/domain/document';
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
  actions,
  images = [],
  sizingUnit = 'px',
  fontSize = 20,
  dimensions = { width: 1000, height: 1000 },
  fields,
  icons,
  onChange,
  onFocus,
  onBlur,
  onReady,
}: {
  value: string;
  actions?: ReactNode;
  images?: readonly ImageAsset[];
  sizingUnit?: SizingUnit;
  fontSize?: number;
  dimensions?: ImageDimensions;
  fields: readonly MetadataField[];
  icons: readonly SvgIcon[];
  onChange: (value: string, images?: ImageAsset[]) => void;
  onFocus: () => void;
  onBlur: () => void;
  onReady: (editor: Editor | null) => void;
}) {
  const callbacks = useRef({ onChange, onFocus, onBlur, onReady });
  useEffect(() => {
    callbacks.current = { onChange, onFocus, onBlur, onReady };
  });
  const imageAssets = useRef<ImageAsset[]>([...images]);
  useEffect(() => {
    imageAssets.current = [...images];
  }, [images]);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const selectedRef = useRef<number | null>(null);
  const inSettings = useRef(false);
  const replacePosition = useRef<number | null>(null);
  const upload = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      callbacks.current.onChange(
        documentTemplate(editor.getJSON()),
        imageAssets.current,
      ),
    onTransaction: ({ editor, transaction }) => {
      const selection = editor.state.selection;
      if (
        selection instanceof NodeSelection &&
        parseImageToken(String(selection.node.attrs.token))
      )
        selectedRef.current = selection.from;
      else if (editor.isFocused && !inSettings.current)
        selectedRef.current = null;
      else if (selectedRef.current !== null && transaction.docChanged) {
        const position = transaction.mapping.map(selectedRef.current);
        selectedRef.current = parseImageToken(
          String(editor.state.doc.nodeAt(position)?.attrs.token),
        )
          ? position
          : null;
      }
      setSelectedPosition(selectedRef.current);
    },
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
          'control-field min-h-24 max-h-48 overflow-y-auto p-2 text-xs leading-7 whitespace-pre-wrap outline-none [&_.ProseMirror-selectednode]:outline-none',
      }),
      clipboardTextSerializer: (slice) =>
        documentTemplate({ type: 'doc', content: slice.content.toJSON() }),
      handleDOMEvents: {
        copy: (view, event) => {
          const data = event.clipboardData;
          if (!data) return false;
          const slice = view.state.selection.content();
          data.setData(
            'text/plain',
            documentTemplate({ type: 'doc', content: slice.content.toJSON() }),
          );
          data.setData(
            'application/x-framenote-content',
            JSON.stringify({
              content: slice.toJSON(),
              images: imageAssets.current.filter((image) =>
                documentTemplate({
                  type: 'doc',
                  content: slice.content.toJSON(),
                }).includes(`image:${image.id}:`),
              ),
            }),
          );
          event.preventDefault();
          return true;
        },
        cut: (view, event) => {
          const data = event.clipboardData;
          if (!data) return false;
          const slice = view.state.selection.content();
          data.setData(
            'text/plain',
            documentTemplate({ type: 'doc', content: slice.content.toJSON() }),
          );
          data.setData(
            'application/x-framenote-content',
            JSON.stringify({
              content: slice.toJSON(),
              images: imageAssets.current.filter((image) =>
                documentTemplate({
                  type: 'doc',
                  content: slice.content.toJSON(),
                }).includes(`image:${image.id}:`),
              ),
            }),
          );
          view.dispatch(view.state.tr.deleteSelection().scrollIntoView());
          event.preventDefault();
          return true;
        },
      },
      handlePaste: (view, event) => {
        const rich = event.clipboardData?.getData(
          'application/x-framenote-content',
        );
        if (rich && rich.length <= 5_000_000) {
          try {
            const data = JSON.parse(rich);
            const incoming = validateImageAssets(data.images, svgIcon);
            const merged = [...imageAssets.current];
            const remap = new Map<string, string>();
            for (const image of incoming) {
              const existing = merged.find((item) => item.id === image.id);
              const id =
                existing && existing.source !== image.source
                  ? createId()
                  : image.id;
              remap.set(image.id, id);
              if (!merged.some((item) => item.id === id))
                merged.push({ ...image, id });
            }
            if (merged.length > 100)
              throw Error('A layer supports up to 100 images.');
            const rewrite = (node: JSONContent): JSONContent => {
              const ref = parseImageToken(String(node.attrs?.token));
              return {
                ...node,
                ...(ref
                  ? {
                      attrs: {
                        ...node.attrs,
                        token: imageToken({
                          ...ref,
                          assetId: remap.get(ref.assetId) ?? ref.assetId,
                        }),
                      },
                    }
                  : {}),
                ...(node.content ? { content: node.content.map(rewrite) } : {}),
              };
            };
            const slice = Slice.fromJSON(view.state.schema, {
              ...data.content,
              content: data.content.content.map(rewrite),
            });
            imageAssets.current = merged;
            view.dispatch(
              view.state.tr.replaceSelection(slice).scrollIntoView(),
            );
            event.preventDefault();
            return true;
          } catch {
            /* Fall back to portable text for invalid clipboard content. */
          }
        }
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
  const token =
    selectedPosition === null
      ? null
      : parseImageToken(
          String(editor?.state.doc.nodeAt(selectedPosition)?.attrs.token),
        );
  const selectedAsset =
    token && images.find((item) => item.id === token.assetId);
  const updateImage = (next: NonNullable<typeof token>) => {
    if (!editor || selectedPosition === null) return;
    editor
      .chain()
      .setNodeSelection(selectedPosition)
      .updateAttributes('captionToken', { token: imageToken(next) })
      .setNodeSelection(selectedPosition)
      .run();
  };
  return (
    <TokenContext.Provider
      value={{
        values,
        icons,
        images,
        selectedImagePosition: selectedPosition,
        imageFontPixels: Math.max(
          0.01,
          toPixels(fontSize, sizingUnit, dimensions),
        ),
        imageUnitPixels: pixelsPerUnit(sizingUnit, dimensions),
      }}
    >
      <div
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={() => setComposing(false)}
      >
        <div className="relative">
          <EditorContent
            editor={editor}
            onPointerDown={() => {
              inSettings.current = false;
            }}
          />
          {!value.trim() && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-3 left-3 text-xs leading-7 text-content-muted"
            >
              Add text, a tag or an icon…
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-end gap-2">
          {actions}
          <Button
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={() => {
              replacePosition.current = null;
              upload.current?.click();
            }}
          >
            <ImagePlus aria-hidden="true" />
            Image
          </Button>
          <input
            ref={upload}
            type="file"
            accept="image/svg+xml,image/png,.svg,.png"
            className="sr-only"
            aria-label="Upload image"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (!file || !editor) return;
              setLoading(true);
              setError('');
              const insertion = {
                from: editor.state.selection.from,
                to: editor.state.selection.to,
              };
              const replaceAt = replacePosition.current;
              const previousToken =
                replaceAt === null
                  ? null
                  : String(editor.state.doc.nodeAt(replaceAt)?.attrs.token);
              const previous = previousToken
                ? parseImageToken(previousToken)
                : null;
              try {
                const asset = await importImage(file, createId());
                if (
                  editor.isDestroyed ||
                  (replaceAt !== null &&
                    String(editor.state.doc.nodeAt(replaceAt)?.attrs.token) !==
                      previousToken)
                )
                  return;
                const existing = imageAssets.current.find(
                  (item) => item.source === asset.source,
                );
                if (!existing && imageAssets.current.length >= 100)
                  throw Error('A layer supports up to 100 images.');
                if (!existing)
                  imageAssets.current = [...imageAssets.current, asset];
                editor
                  .chain()
                  .focus()
                  .insertContentAt(
                    replaceAt === null
                      ? insertion
                      : { from: replaceAt, to: replaceAt + 1 },
                    {
                      type: 'captionToken',
                      attrs: {
                        token: imageToken({
                          height: 2,
                          unit: 'font',
                          colorMode: 'original',
                          ...previous,
                          assetId: existing?.id ?? asset.id,
                        }),
                      },
                    },
                  )
                  .run();
              } catch (cause) {
                setError(
                  cause instanceof Error
                    ? cause.message
                    : 'Could not load image.',
                );
              } finally {
                setLoading(false);
              }
            }}
          />
        </div>
        {error && (
          <p role="alert" className="mt-2 text-xs">
            {error}
          </p>
        )}
        {token && selectedAsset && (
          <div
            aria-label="Selected image settings"
            className="mt-3 space-y-3 rounded-lg border border-container-settings-border bg-selected-element-base p-3"
            onPointerDownCapture={() => {
              inSettings.current = true;
            }}
            onFocusCapture={() => {
              inSettings.current = true;
            }}
          >
            <p className="text-xs text-content-secondary">
              Selected image · {selectedAsset.name}
            </p>
            <SegmentedControl
              label="Image sizing"
              value={token.unit}
              options={[
                { value: 'font', label: 'Relative to font' },
                { value: 'document', label: 'Fixed height' },
              ]}
              onValueChange={(unit) => {
                const font = Math.max(
                  0.01,
                  toPixels(fontSize, sizingUnit, dimensions),
                );
                const px =
                  token.unit === 'font'
                    ? token.height * font
                    : toPixels(token.height, sizingUnit, dimensions);
                updateImage({
                  ...token,
                  unit,
                  height:
                    unit === 'font'
                      ? px / font
                      : px / pixelsPerUnit(sizingUnit, dimensions),
                });
              }}
            />
            <NumberField
              label="Image height"
              showSteppers
              value={token.height}
              min={token.unit === 'font' ? 0.25 : sizingUnit === 'px' ? 1 : 0.1}
              max={1e7}
              step={
                token.unit === 'font' ? 0.25 : sizingUnit === 'px' ? 1 : 0.1
              }
              unit={token.unit === 'font' ? '×' : sizingLabels[sizingUnit]}
              onValueChange={(height) => updateImage({ ...token, height })}
            />
            {selectedAsset.format === 'svg' && (
              <SegmentedControl
                label="Image colors"
                value={token.colorMode}
                options={[
                  { value: 'original', label: 'Original colors' },
                  { value: 'single', label: 'Layer color' },
                ]}
                onValueChange={(colorMode) =>
                  updateImage({ ...token, colorMode })
                }
              />
            )}
            {selectedAsset.format === 'png' &&
              (token.unit === 'font'
                ? token.height * toPixels(fontSize, sizingUnit, dimensions)
                : toPixels(token.height, sizingUnit, dimensions)) >
                selectedAsset.height && (
                <p className="text-xs text-content-secondary">
                  Larger than the source image; exported edges may look soft.
                </p>
              )}
            <Button
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={() => {
                replacePosition.current = selectedPosition;
                upload.current?.click();
              }}
            >
              Replace image
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                editor
                  ?.chain()
                  .setNodeSelection(selectedPosition!)
                  .deleteSelection()
                  .run()
              }
            >
              Remove image
            </Button>
          </div>
        )}
      </div>
    </TokenContext.Provider>
  );
}
