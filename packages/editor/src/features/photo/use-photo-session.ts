import { platform } from '@/lib/platform';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createId } from '@/lib/create-id';
import { loadPhoto, type LoadedPhoto } from './load-photo';
import {
  defaultSessionDocument,
  type SessionDocument,
} from './session-document';
import {
  activeDocument,
  removeSessionPhoto,
  setPhotoDocument,
  type PhotoSessionState,
} from './session-state';
import { EditHistorySession } from './edit-history';
import type { EditOptions } from './session-document';
import { photoThumbnail } from './photo-thumbnail';

export function usePhotoSession() {
  const [session, setSession] = useState<PhotoSessionState>(() => ({
    items: [],
    activeId: null,
    empty: { id: createId(), editor: defaultSessionDocument() },
  }));
  const [history] = useState(() => {
    const value = new EditHistorySession({
      limit: platform().configuration?.current().historyLimit,
    });
    value.reset(session.empty.id, session.empty.editor);
    return value;
  });
  useEffect(
    () =>
      platform().configuration?.subscribe(() => {
        history.setLimit(platform().configuration!.current().historyLimit);
        setSession((value) => ({ ...value }));
      }),
    [history],
  );
  const group = useRef<string | null>(null);
  const state = useRef(session);
  const [photo, setPhoto] = useState<LoadedPhoto | null>(null);
  const currentPhoto = useRef<LoadedPhoto | null>(null);
  const resources = useRef(new Set<LoadedPhoto>());
  const thumbnails = useRef(new Set<string>());
  const generation = useRef(0);
  const busy = useRef(false);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState('');
  const commit = useCallback(
    (next: PhotoSessionState) => {
      history.synchronize(state.current, next);
      state.current = next;
      setSession(next);
    },
    [history],
  );
  const finishEdit = useCallback(() => {
    history.commit(state.current.activeId ?? state.current.empty.id);
    group.current = null;
    setSession({ ...state.current });
  }, [history]);
  const beginEdit = useCallback(
    (label: string, key = label) => {
      const id = state.current.activeId ?? state.current.empty.id;
      if (group.current === key) return;
      history.begin(id, label);
      group.current = key;
    },
    [history],
  );
  const cancelEdit = useCallback(() => {
    const id = state.current.activeId ?? state.current.empty.id;
    history.cancel(id);
    group.current = null;
    commit(setPhotoDocument(state.current, id, history.document(id)));
  }, [commit, history]);
  const restoreHistory = useCallback(
    (direction: 'undo' | 'redo') => {
      if (busy.current) return;
      // Blur synchronously settles the focused field before choosing a step.
      if (document.activeElement instanceof HTMLInputElement)
        document.activeElement.blur();
      const id = state.current.activeId ?? state.current.empty.id;
      const restored = history[direction](id);
      group.current = null;
      commit(setPhotoDocument(state.current, id, restored));
    },
    [commit, history],
  );
  const showPhoto = useCallback((loaded: LoadedPhoto | null) => {
    if (loaded) resources.current.add(loaded);
    currentPhoto.current = loaded;
    setPhoto(loaded);
  }, []);
  const previewReady = useCallback((loaded: LoadedPhoto) => {
    if (currentPhoto.current === loaded) setPreviewLoading(false);
  }, []);
  const updateDocument = useCallback(
    (
      update: (value: SessionDocument) => SessionDocument,
      options?: EditOptions,
    ) => {
      const id =
        options?.targetId ?? state.current.activeId ?? state.current.empty.id;
      const original =
        state.current.items.find((item) => item.id === id)?.editor ??
        (id === state.current.empty.id ? state.current.empty.editor : null);
      if (!original) return;
      const updated = update(original);
      const layerId = updated.layout.activeId;
      const editor =
        options?.selectionAfter && layerId
          ? { ...updated, selection: { ...options.selectionAfter, layerId } }
          : updated;
      if (options?.selectionBefore && layerId)
        history.observe(id, {
          ...original,
          selection: { ...options.selectionBefore, layerId },
        });
      if (options?.viewOnly) history.observe(id, editor);
      else {
        if (options?.group) beginEdit(options.label ?? 'Typing', options.group);
        if (
          options?.label &&
          !options.group &&
          !(options.gesture && group.current && group.current !== 'typing')
        ) {
          history.record(id, editor, options.label);
          group.current = null;
        } else if (group.current) history.update(id, editor);
        else history.record(id, editor, 'Edit layout');
      }
      commit(setPhotoDocument(state.current, id, editor));
    },
    [commit, history, beginEdit],
  );

  const openFiles = useCallback(
    async (files: readonly File[]) => {
      if (!files.length) return;
      if (busy.current) {
        setError(
          'Please wait for the current import to finish before adding more photos.',
        );
        return;
      }
      // A drop need not move focus. Commit numeric drafts before the document
      // changes, so a focused field cannot display the previous photo's value.
      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
      finishEdit();
      busy.current = true;
      const token = ++generation.current;
      setError('');
      setPreviewLoading(true);
      setProgress({ done: 0, total: files.length });
      const importDocument = structuredClone(activeDocument(state.current));
      let activated = false;
      const failures: string[] = [];
      try {
        // Give the progress indicator a frame before parsing and decoding.
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
        for (const [index, file] of files.entries()) {
          if (generation.current !== token) break;
          let loaded: LoadedPhoto | undefined;
          let thumbnailUrl: string | undefined;
          try {
            loaded = await loadPhoto(file, { snapshotSource: true });
            if (generation.current !== token) break;
            thumbnailUrl = await photoThumbnail(loaded);
            if (generation.current !== token) break;
            const first = !state.current.items.length;
            const id =
              first && !state.current.items.length
                ? state.current.empty.id
                : createId();
            const item = {
              id,
              file: loaded.sourceFile,
              photo: loaded.document.photo,
              thumbnailUrl,
              editor: structuredClone(importDocument),
            };
            thumbnails.current.add(thumbnailUrl);
            thumbnailUrl = undefined;
            commit({
              ...state.current,
              items: [...state.current.items, item],
              activeId: activated ? state.current.activeId : id,
            });
            if (!activated) {
              setPreviewLoading(true);
              showPhoto(loaded);
              loaded = undefined;
              activated = true;
            }
          } catch (cause) {
            failures.push(
              `${file.name}: ${cause instanceof Error ? cause.message : 'Could not open photo.'}`,
            );
          } finally {
            loaded?.dispose();
            if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
          }
          if (generation.current === token)
            setProgress({
              done: index + 1,
              total: files.length,
            });
        }
      } finally {
        if (generation.current === token) {
          busy.current = false;
          setProgress(null);
          setError(failures.join('\n'));
          if (!activated) setPreviewLoading(false);
        }
      }
    },
    [commit, showPhoto, finishEdit],
  );

  const selectPhoto = useCallback(
    async (id: string) => {
      if (
        busy.current ||
        (state.current.activeId === id && currentPhoto.current)
      )
        return;
      const item = state.current.items.find((item) => item.id === id);
      if (!item) return;
      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
      finishEdit();
      busy.current = true;
      const token = ++generation.current;
      setProgress({ done: 0, total: 1 });
      setPreviewLoading(true);
      setError('');
      try {
        const loaded = await loadPhoto(item.file);
        if (token !== generation.current) {
          loaded.dispose();
          return;
        }
        commit({ ...state.current, activeId: id });
        showPhoto(loaded);
      } catch (cause) {
        if (token === generation.current) {
          setPreviewLoading(false);
          setError(
            cause instanceof Error ? cause.message : 'Could not open photo.',
          );
        }
      } finally {
        if (token === generation.current) {
          busy.current = false;
          setProgress(null);
        }
      }
    },
    [commit, showPhoto, finishEdit],
  );

  const cancelImport = useCallback(() => {
    generation.current++;
    busy.current = false;
    setProgress(null);
    setPreviewLoading(false);
  }, []);
  const copySettings = useCallback((id?: string) => {
    const source = id
      ? state.current.items.find((item) => item.id === id)?.editor
      : activeDocument(state.current);
    return source ? structuredClone(source) : null;
  }, []);
  const pasteSettings = useCallback(
    (id: string, editor: SessionDocument) => {
      if (busy.current) return;
      if (
        !state.current.items.some((item) => item.id === id) &&
        state.current.empty.id !== id
      )
        return;
      finishEdit();
      history.record(id, editor, 'Paste settings');
      commit(setPhotoDocument(state.current, id, structuredClone(editor)));
    },
    [commit, history, finishEdit],
  );
  const closePhoto = useCallback(() => {
    if (busy.current || !state.current.activeId) return;
    finishEdit();
    const next = removeSessionPhoto(state.current, state.current.activeId);
    commit(next);
    showPhoto(null);
    setPreviewLoading(false);
    setError('');
    if (next.activeId) void selectPhoto(next.activeId);
  }, [commit, selectPhoto, showPhoto, finishEdit]);
  const disposeRoll = useCallback(() => {
    cancelImport();
    finishEdit();
    const editor = activeDocument(state.current);
    commit({
      items: [],
      activeId: null,
      empty: {
        id: state.current.activeId ?? state.current.empty.id,
        editor,
      },
    });
    showPhoto(null);
    setError('');
  }, [cancelImport, commit, showPhoto, finishEdit]);

  useEffect(() => {
    for (const loaded of resources.current) {
      if (loaded !== photo && loaded !== currentPhoto.current) {
        loaded.dispose();
        resources.current.delete(loaded);
      }
    }
    // Imports may append a thumbnail before an effect from the preceding render
    // runs. Use the committed ref so that effect cannot revoke a newer item.
    const retained = new Set(
      state.current.items.map((item) => item.thumbnailUrl),
    );
    for (const url of thumbnails.current) {
      if (!retained.has(url)) {
        URL.revokeObjectURL(url);
        thumbnails.current.delete(url);
      }
    }
  }, [photo, session.items]);
  useEffect(
    () => () => {
      generation.current++;
      for (const loaded of resources.current) loaded.dispose();
      resources.current.clear();
      for (const url of thumbnails.current) URL.revokeObjectURL(url);
      thumbnails.current.clear();
    },
    [],
  );

  return {
    session,
    photo,
    progress,
    previewLoading,
    error,
    setError,
    openFiles,
    selectPhoto,
    closePhoto,
    disposeRoll,
    cancelImport,
    previewReady,
    updateDocument,
    beginEdit,
    finishEdit,
    finishTyping: useCallback(() => {
      if (group.current === 'typing') finishEdit();
    }, [finishEdit]),
    cancelEdit,
    restoreHistory,
    retainSettings: (value: SessionDocument | null) =>
      history.retain(value ? [value] : []),
    historyStatus: history.status(session.activeId ?? session.empty.id),
    copySettings,
    pasteSettings,
    document: activeDocument(session),
    documentKey: session.activeId ?? session.empty.id,
  };
}
