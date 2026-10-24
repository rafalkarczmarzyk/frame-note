import { PhotoLimitError, validateFileSize, validateImageSize } from './limits';
import { createPhotoDocument, type PhotoDocument } from '../../domain/document';
import { isJpeg, normalizeMetadata } from './metadata';

export interface LoadedPhoto {
  document: PhotoDocument;
  image: HTMLImageElement;
  dispose: () => void;
}

export async function loadPhoto(file: File): Promise<LoadedPhoto> {
  validateFileSize(file.size);
  const bytes = await file.arrayBuffer();
  if (!isJpeg(new Uint8Array(bytes)))
    throw new Error('Please choose a valid JPG photo.');
  const url = URL.createObjectURL(file);
  try {
    const { default: ExifReader } = await import('exifreader');
    const tags = await ExifReader.load(bytes, { expanded: true, async: true });
    const metadata = normalizeMetadata(tags);
    const sourceWidth = metadata.find(
      (field) => field.key === 'file:Image Width',
    )?.rawValue;
    const sourceHeight = metadata.find(
      (field) => field.key === 'file:Image Height',
    )?.rawValue;
    if (typeof sourceWidth === 'number' && typeof sourceHeight === 'number')
      validateImageSize(sourceWidth, sourceHeight);
    const image = new Image();
    image.src = url;
    await image.decode();
    validateImageSize(image.naturalWidth, image.naturalHeight);
    return {
      image,
      document: createPhotoDocument({
        name: file.name,
        mimeType: 'image/jpeg',
        byteLength: file.size,
        dimensions: { width: image.naturalWidth, height: image.naturalHeight },
        metadata,
      }),
      dispose: () => URL.revokeObjectURL(url),
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    if (error instanceof PhotoLimitError) throw error;
    throw new Error('This photo could not be read. Try another JPG.', {
      cause: error,
    });
  }
}
