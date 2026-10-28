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
  updateSessionDocument,
  type PhotoSessionState,
} from './session-state';
import { photoThumbnail } from './photo-thumbnail';

export function usePhotoSession() {
  const [session, setSession] = useState<PhotoSessionState>(() => ({
    items: [],
    activeId: null,
    empty: { id: createId(), editor: defaultSessionDocument() },
  }));
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
  const commit = useCallback((next: PhotoSessionState) => {
    state.current = next;
    setSession(next);
  }, []);
  const showPhoto = useCallback((loaded: LoadedPhoto | null) => {
    if (loaded) resources.current.add(loaded);
    currentPhoto.current = loaded;
    setPhoto(loaded);
  }, []);
  const previewReady = useCallback((loaded: LoadedPhoto) => {
    if (currentPhoto.current === loaded) setPreviewLoading(false);
  }, []);
  const updateDocument = useCallback(
    (update: (value: SessionDocument) => SessionDocument) => {
      commit(updateSessionDocument(state.current, update));
    },
    [commit],
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
      busy.current = true;
      const token = ++generation.current;
      setError('');
      setPreviewLoading(true);
      setProgress({ done: 0, total: files.length });
      const retainLayout = !state.current.items.length && files.length === 1;
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
              first && retainLayout ? state.current.empty.id : createId();
            const item = {
              id,
              file: loaded.sourceFile,
              photo: loaded.document.photo,
              thumbnailUrl,
              editor: retainLayout
                ? activeDocument(state.current)
                : defaultSessionDocument(),
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
    [commit, showPhoto],
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
    [commit, showPhoto],
  );

  const cancelImport = useCallback(() => {
    generation.current++;
    busy.current = false;
    setProgress(null);
    setPreviewLoading(false);
  }, []);
  const closePhoto = useCallback(() => {
    if (busy.current || !state.current.activeId) return;
    const next = removeSessionPhoto(state.current, state.current.activeId);
    commit(next);
    showPhoto(null);
    setPreviewLoading(false);
    setError('');
    if (next.activeId) void selectPhoto(next.activeId);
  }, [commit, selectPhoto, showPhoto]);
  const disposeRoll = useCallback(() => {
    cancelImport();
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
  }, [cancelImport, commit, showPhoto]);

  useEffect(() => {
    for (const loaded of resources.current) {
      if (loaded !== photo && loaded !== currentPhoto.current) {
        loaded.dispose();
        resources.current.delete(loaded);
      }
    }
    const retained = new Set(session.items.map((item) => item.thumbnailUrl));
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
    document: activeDocument(session),
    documentKey: session.activeId ?? session.empty.id,
  };
}
