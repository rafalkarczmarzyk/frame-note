import { createPhotoDocument, type PhotoDocument } from '../../domain/document';
import { isJpeg, normalizeMetadata } from './metadata';

export interface LoadedPhoto {
  document: PhotoDocument;
  image: HTMLImageElement;
  dispose: () => void;
}

export async function loadPhoto(file: File): Promise<LoadedPhoto> {
  const bytes = await file.arrayBuffer();
  if (!isJpeg(new Uint8Array(bytes)))
    throw new Error('Please choose a valid JPG photo.');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const { default: ExifReader } = await import('exifreader');
    const tags = await ExifReader.load(bytes, { expanded: true, async: true });
    return {
      image,
      document: createPhotoDocument({
        name: file.name,
        mimeType: 'image/jpeg',
        byteLength: file.size,
        dimensions: { width: image.naturalWidth, height: image.naturalHeight },
        metadata: normalizeMetadata(tags),
      }),
      dispose: () => URL.revokeObjectURL(url),
    };
  } catch {
    URL.revokeObjectURL(url);
    throw new Error('This photo could not be read. Try another JPG.');
  }
}
