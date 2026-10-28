import { closeHistory } from '@tiptap/pm/history';
import { CaptionWhitespace, whitespaceKey } from './whitespace-extension';
import { metadataTokenStatus } from './token-status';
import { ElementSizeSettings } from './element-size-settings';
import {
  parseIconToken,
  iconToken,
  type ElementSizing,
} from '@/domain/inline-icon';
import { Tooltip } from '@/components/ui/tooltip';
import {
  activeImageAssets,
  checkImageRetention,
} from '@/domain/image-retention';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ContentImageDropOverlay } from './content-image-drop-overlay';
import { ImagePlus, Plus, Tag, Camera, Trash2, Pilcrow } from 'lucide-react';
import { createId } from '@/lib/create-id';
import type { JSONContent } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import {
  imageToken,
  parseImageToken,
  type ImageAsset,
} from '@/domain/inline-image';
import { importImage, prepareImageAssets } from '../image-assets';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import {
  toPixels,
  pixelsPerUnit,
  sizingLabels,
  type SizingUnit,
} from '@/domain/sizing';
import type { ImageDimensions } from '@/domain/document';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Fragment, Slice } from '@tiptap/pm/model';
import type { MetadataField } from '@/domain/metadata';
import { captionTags } from '@/domain/caption-tags';
import { CaptionToken } from './token-extension';
import { templateDocument, documentTemplate } from './template-document';
import { TokenContext } from './token-context';
import type { SvgIcon } from '../svg-icons';

export interface GraphicsEditorActions {
  upload: () => void;
  insert: (asset: ImageAsset) => void;
}

export function CaptionEditor({
  value,
  actions,
  images = [],
  sizingUnit = 'px',
  fontSize = 20,
  dimensions = { width: 1000, height: 1000 },
  fields,
  hasPhoto = true,
  icons,
  onChange,
  onFocus,
  onBlur,
  onReady,
  onGraphicsActionsReady,
}: {
  value: string;
  actions?: ReactNode;
  images?: readonly ImageAsset[];
  sizingUnit?: SizingUnit;
  fontSize?: number;
  dimensions?: ImageDimensions;
  fields: readonly MetadataField[];
  hasPhoto?: boolean;
  icons: readonly SvgIcon[];
  onChange: (value: string, images?: ImageAsset[]) => void;
  onFocus: () => void;
  onBlur: () => void;
  onReady: (editor: Editor | null) => void;
  onGraphicsActionsReady?: (actions: GraphicsEditorActions | null) => void;
}) {
  const callbacks = useRef({ onChange, onFocus, onBlur, onReady });
  useEffect(() => {
    callbacks.current = { onChange, onFocus, onBlur, onReady };
  });
  const revision = useRef(0);
  const imageAssets = useRef<ImageAsset[]>([...images]);
  useEffect(() => {
    const retained = new Map(
      imageAssets.current.map((asset) => [asset.id, asset]),
    );
    for (const asset of images) retained.set(asset.id, asset);
    imageAssets.current = [...retained.values()];
  }, [images]);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const selectedRef = useRef<number | null>(null);
  const inSettings = useRef(false);
  const replacePosition = useRef<number | null>(null);
  const upload = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const importingImage = useRef(false);
  const [dropSurface, setDropSurface] = useState<HTMLElement | null>(null);
  const [draggingImage, setDraggingImage] = useState(false);
  const attachDropSurface = useCallback((node: HTMLDivElement | null) => {
    setDropSurface(
      node?.parentElement?.closest<HTMLElement>('[data-content-image-drop]') ??
        node,
    );
  }, []);
  const [showWhitespace, setShowWhitespace] = useState(true);
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
      CaptionWhitespace,
    ],
    content: templateDocument(value),
    onUpdate: ({ editor }) =>
      callbacks.current.onChange(
        documentTemplate(editor.getJSON()),
        activeImageAssets(
          documentTemplate(editor.getJSON()),
          imageAssets.current,
        ),
      ),
    onTransaction: ({ editor, transaction }) => {
      if (transaction.docChanged) revision.current++;
      const selection = editor.state.selection;
      if (
        selection instanceof NodeSelection &&
        selection.node.type.name === 'captionToken'
      )
        selectedRef.current = selection.from;
      else if (editor.isFocused && !inSettings.current)
        selectedRef.current = null;
      else if (selectedRef.current !== null && transaction.docChanged) {
        const position = transaction.mapping.map(selectedRef.current);
        selectedRef.current =
          editor.state.doc.nodeAt(position)?.type.name === 'captionToken'
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
          'caption-content-editor control-field min-h-24 max-h-48 overflow-y-auto p-2 text-xs whitespace-pre-wrap outline-none [&_.ProseMirror-selectednode]:outline-none',
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
        const text = event.clipboardData?.getData('text/plain');
        if (!rich && text === undefined) return false;
        event.preventDefault();
        const startRevision = revision.current;
        const selection = view.state.selection;
        const alive = () => {
          if (view.isDestroyed) return false;
          if (revision.current !== startRevision) {
            setError(
              'Content changed while the image was loading. Paste again at the desired position.',
            );
            return false;
          }
          return true;
        };
        void (async () => {
          let pasteWarning = '';
          if (rich && new Blob([rich]).size <= 5_000_000) {
            try {
              const data = JSON.parse(rich);
              const incoming = await prepareImageAssets(data.images);
              if (!alive()) return;
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
                  ...(node.content
                    ? { content: node.content.map(rewrite) }
                    : {}),
                };
              };
              if (!data.content || !Array.isArray(data.content.content))
                throw Error('Invalid clipboard content.');
              const slice = Slice.fromJSON(view.state.schema, {
                ...data.content,
                content: data.content.content.map(rewrite),
              });
              slice.content.descendants((node) => {
                if (
                  !['paragraph', 'text', 'hardBreak', 'captionToken'].includes(
                    node.type.name,
                  ) ||
                  node.marks.length
                )
                  throw Error('Invalid clipboard content.');
                if (
                  node.type.name === 'captionToken' &&
                  typeof node.attrs.token !== 'string'
                )
                  throw Error('Invalid clipboard token.');
              });
              const transaction = view.state.tr
                .setSelection(selection)
                .replaceSelection(slice)
                .scrollIntoView();
              checkImageRetention(
                documentTemplate(transaction.doc.toJSON()),
                merged,
              );
              imageAssets.current = merged;
              view.dispatch(transaction);
              setError('');
              return;
            } catch {
              if (!alive()) return;
              pasteWarning =
                'Could not paste images. Portable text was used instead.';
              setError(pasteWarning);
            }
          }
          if (!alive() || text === undefined) return;
          try {
            const doc = view.state.schema.nodeFromJSON(templateDocument(text));
            const transaction = view.state.tr
              .setSelection(selection)
              .replaceSelection(new Slice(Fragment.from(doc.content), 1, 1))
              .scrollIntoView();
            checkImageRetention(
              documentTemplate(transaction.doc.toJSON()),
              imageAssets.current,
            );
            view.dispatch(transaction);
            setError(pasteWarning);
          } catch (cause) {
            setError(
              cause instanceof Error
                ? cause.message
                : 'Could not paste content.',
            );
          }
        })().catch(() => {
          if (!view.isDestroyed) setError('Could not paste content.');
        });
        return true;
      },
    },
  });
  const addImage = useCallback(
    async (file: File, replaceAt: number | null = null) => {
      if (!editor || editor.isDestroyed || importingImage.current) return;
      importingImage.current = true;
      setLoading(true);
      setError('');
      const startRevision = revision.current;
      const insertion = {
        from: editor.state.selection.from,
        to: editor.state.selection.to,
      };
      const previousToken =
        replaceAt === null
          ? null
          : String(editor.state.doc.nodeAt(replaceAt)?.attrs.token);
      const previous = previousToken ? parseImageToken(previousToken) : null;
      try {
        const asset = await importImage(file, createId());
        if (editor.isDestroyed) return;
        if (
          revision.current !== startRevision ||
          (replaceAt !== null &&
            String(editor.state.doc.nodeAt(replaceAt)?.attrs.token) !==
              previousToken)
        )
          throw Error(
            'Content changed while the image was loading. Add the image again at the desired position.',
          );
        const existing = imageAssets.current.find(
          (item) => item.source === asset.source,
        );
        const added = existing
          ? imageAssets.current
          : [...imageAssets.current, asset];
        const tokenValue = imageToken({
          height: 2,
          unit: 'font',
          colorMode: 'original',
          ...previous,
          assetId: existing?.id ?? asset.id,
        });
        const target =
          replaceAt === null
            ? insertion
            : { from: replaceAt, to: replaceAt + 1 };
        const next = editor.state.tr.replaceWith(
          target.from,
          target.to,
          editor.schema.nodes.captionToken!.create({
            token: tokenValue,
          }),
        );
        checkImageRetention(documentTemplate(next.doc.toJSON()), added);
        if (!existing) imageAssets.current = [...imageAssets.current, asset];
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
        if (editor.isDestroyed) return;
        setError(
          cause instanceof Error ? cause.message : 'Could not load image.',
        );
      } finally {
        importingImage.current = false;
        if (!editor.isDestroyed) setLoading(false);
      }
    },
    [editor],
  );
  const insertGraphic = useCallback(
    (asset: ImageAsset) => {
      if (!editor || editor.isDestroyed) return;
      const existing = imageAssets.current.find(
        (item) => item.source === asset.source,
      );
      const retained = existing
        ? imageAssets.current
        : [...imageAssets.current, asset];
      const token = imageToken({
        assetId: existing?.id ?? asset.id,
        height: 2,
        unit: 'font',
        colorMode: 'original',
      });
      const transaction = editor.state.tr.replaceSelectionWith(
        editor.schema.nodes.captionToken!.create({ token }),
      );
      try {
        checkImageRetention(
          documentTemplate(transaction.doc.toJSON()),
          retained,
        );
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : 'Could not insert graphic.',
        );
        return;
      }
      if (!existing) imageAssets.current = retained;
      editor
        .chain()
        .focus()
        .insertContent({ type: 'captionToken', attrs: { token } })
        .run();
    },
    [editor],
  );
  const openImageUpload = useCallback(() => {
    replacePosition.current = null;
    upload.current?.click();
  }, []);
  useEffect(() => {
    onGraphicsActionsReady?.({
      upload: openImageUpload,
      insert: insertGraphic,
    });
    return () => onGraphicsActionsReady?.(null);
  }, [insertGraphic, onGraphicsActionsReady, openImageUpload]);
  useEffect(() => {
    if (!dropSurface) return;
    const isFileDrag = (event: DragEvent) =>
      Array.from(event.dataTransfer?.types ?? []).includes('Files');
    const reset = () => setDraggingImage(false);
    const over = (event: DragEvent) => {
      if (!isFileDrag(event)) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer)
        event.dataTransfer.dropEffect = importingImage.current
          ? 'none'
          : 'copy';
      setDraggingImage(!importingImage.current);
    };
    const leave = (event: DragEvent) => {
      const next =
        event.relatedTarget ??
        document.elementFromPoint(event.clientX, event.clientY);
      if (!(next instanceof Node) || !dropSurface.contains(next)) reset();
    };
    const drop = (event: DragEvent) => {
      if (!isFileDrag(event)) return;
      event.preventDefault();
      event.stopPropagation();
      reset();
      if (importingImage.current) return;
      const files = event.dataTransfer?.files;
      if (!files?.length) return;
      if (files.length !== 1) {
        setError('Please add one SVG or PNG image at a time.');
        return;
      }
      replacePosition.current = null;
      void addImage(files[0]!);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') reset();
    };
    dropSurface.addEventListener('dragenter', over, true);
    dropSurface.addEventListener('dragover', over, true);
    dropSurface.addEventListener('dragleave', leave);
    dropSurface.addEventListener('drop', drop, true);
    window.addEventListener('dragend', reset);
    window.addEventListener('blur', reset);
    window.addEventListener('keydown', key);
    return () => {
      dropSurface.removeEventListener('dragenter', over, true);
      dropSurface.removeEventListener('dragover', over, true);
      dropSurface.removeEventListener('dragleave', leave);
      dropSurface.removeEventListener('drop', drop, true);
      window.removeEventListener('dragend', reset);
      window.removeEventListener('blur', reset);
      window.removeEventListener('keydown', key);
    };
  }, [dropSurface, addImage]);
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
  const selectedToken =
    selectedPosition === null
      ? null
      : String(editor?.state.doc.nodeAt(selectedPosition)?.attrs.token ?? '');
  const selectedIcon = selectedToken ? parseIconToken(selectedToken) : null;
  const selectedIconAsset = icons.find(
    (item) => item.name === selectedIcon?.name,
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
  const selectedSizing = token ?? selectedIcon;
  const updateSizing = (next: ElementSizing) => {
    if (token) updateImage({ ...token, ...next });
    else if (selectedIcon && editor && selectedPosition !== null)
      editor
        .chain()
        .setNodeSelection(selectedPosition)
        .updateAttributes('captionToken', {
          token: iconToken({ ...selectedIcon, ...next }),
        })
        .setNodeSelection(selectedPosition)
        .run();
  };
  return (
    <TokenContext.Provider
      value={{
        values,
        hasPhoto,
        icons,
        images,
        selectedImagePosition: selectedPosition,
      }}
    >
      <div
        ref={attachDropSurface}
        data-content-image-drop
        className="relative"
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={() => setComposing(false)}
      >
        {draggingImage &&
          dropSurface &&
          createPortal(<ContentImageDropOverlay />, dropSurface)}
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
        <div className="mt-2 flex w-full items-center gap-2">
          <Plus
            aria-hidden="true"
            className="size-4 shrink-0 text-content-secondary"
          />
          <div
            role="group"
            aria-label="Add content"
            className="control-segments grid min-w-0 flex-1 auto-cols-auto grid-flow-col items-center gap-1 p-1"
          >
            {actions}
            <input
              ref={upload}
              type="file"
              accept="image/svg+xml,image/png,.svg,.png"
              className="sr-only"
              aria-label="Upload image"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (file) void addImage(file, replacePosition.current);
              }}
            />
          </div>
          <span className="control-segments inline-flex shrink-0 p-1">
            <Tooltip
              content={
                showWhitespace
                  ? 'Hide spaces and line breaks'
                  : 'Show spaces and line breaks'
              }
            >
              <button
                type="button"
                aria-label="Show formatting marks"
                aria-pressed={showWhitespace}
                className="control-segment flex size-7 shrink-0 items-center justify-center"
                data-state={showWhitespace ? 'on' : 'off'}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  const next = !showWhitespace;
                  setShowWhitespace(next);
                  if (editor)
                    editor.view.dispatch(
                      closeHistory(editor.state.tr)
                        .setMeta(whitespaceKey, next)
                        .setMeta('addToHistory', false),
                    );
                }}
              >
                <Pilcrow aria-hidden="true" className="size-4" />
              </button>
            </Tooltip>
          </span>
        </div>
        {loading && (
          <p role="status" className="mt-2 text-xs text-content-secondary">
            Loading image…
          </p>
        )}
        {error && (
          <p role="alert" className="mt-2 text-xs">
            {error}
          </p>
        )}
        {selectedToken && (
          <div
            aria-label={
              token ? 'Selected image settings' : 'Selected element settings'
            }
            className="mt-3 space-y-3 rounded-lg border border-container-settings-border bg-selected-element-base p-3"
            onPointerDownCapture={() => {
              inSettings.current = true;
            }}
            onFocusCapture={() => {
              inSettings.current = true;
            }}
          >
            <div className="flex min-w-0 items-center gap-2">
              {token ? (
                <ImagePlus aria-hidden="true" className="size-4 shrink-0" />
              ) : selectedIcon ? (
                <Camera aria-hidden="true" className="size-4 shrink-0" />
              ) : (
                <Tag aria-hidden="true" className="size-4 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-xs text-content-secondary">
                  {token
                    ? (selectedAsset?.format.toUpperCase() ?? 'Image')
                    : selectedIcon
                      ? 'Icon'
                      : 'Metadata'}
                </p>
                <p className="truncate text-sm">
                  {selectedAsset?.name ??
                    selectedIconAsset?.name ??
                    selectedIcon?.name ??
                    selectedToken}
                </p>
              </div>
            </div>
            {selectedSizing ? (
              <ElementSizeSettings
                height={selectedSizing.height}
                unit={selectedSizing.unit}
                alignment={selectedSizing.alignment ?? 'center'}
                documentUnit={sizingLabels[sizingUnit]}
                onHeight={(height) =>
                  updateSizing({ ...selectedSizing, height })
                }
                onAlignment={(alignment) =>
                  updateSizing({ ...selectedSizing, alignment })
                }
                onUnit={(unit) => {
                  const font = Math.max(
                    0.01,
                    toPixels(fontSize, sizingUnit, dimensions),
                  );
                  const px =
                    selectedSizing.unit === 'font'
                      ? selectedSizing.height * font
                      : toPixels(selectedSizing.height, sizingUnit, dimensions);
                  updateSizing({
                    ...selectedSizing,
                    unit,
                    height:
                      unit === 'font'
                        ? px / font
                        : px / pixelsPerUnit(sizingUnit, dimensions),
                  });
                }}
              />
            ) : (
              <div className="space-y-1">
                <p className="text-xs text-content-secondary">Value</p>
                <p className="rounded border border-border-subtle p-2 text-sm break-words">
                  {!hasPhoto
                    ? 'Open a photo to preview this value'
                    : values[selectedToken]?.trim()
                      ? values[selectedToken]
                      : metadataTokenStatus(selectedToken, values) === 'absent'
                        ? 'Tag not found in this photo.'
                        : 'No value returned for this photo.'}
                </p>
              </div>
            )}
            {token && selectedAsset?.format === 'svg' && (
              <SegmentedControl
                label="Image colors"
                value={token.colorMode}
                options={[
                  {
                    value: 'original',
                    label: 'Original colors',
                    tooltip: 'Keep the SVG’s original colors',
                  },
                  {
                    value: 'single',
                    label: 'Layer color',
                    tooltip: 'Use the layer’s text color for this SVG',
                  },
                ]}
                onValueChange={(colorMode) =>
                  updateImage({ ...token, colorMode })
                }
              />
            )}
            {token &&
              selectedAsset?.format === 'png' &&
              (token.unit === 'font'
                ? token.height * toPixels(fontSize, sizingUnit, dimensions)
                : toPixels(token.height, sizingUnit, dimensions)) >
                selectedAsset.height && (
                <p className="text-xs text-content-secondary">
                  Larger than the source image; exported edges may look soft.
                </p>
              )}
            {token && selectedAsset && (
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                disabled={loading}
                onClick={() => {
                  replacePosition.current = selectedPosition;
                  upload.current?.click();
                }}
              >
                Replace image
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() =>
                editor
                  ?.chain()
                  .setNodeSelection(selectedPosition!)
                  .deleteSelection()
                  .run()
              }
            >
              <Trash2 aria-hidden="true" />
              Remove
            </Button>
          </div>
        )}
      </div>
    </TokenContext.Provider>
  );
}
