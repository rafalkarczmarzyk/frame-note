import { PhotoLimitError, validateFileSize, validateImageSize } from './limits';
import { createPhotoDocument, type PhotoDocument } from '../../domain/document';
import { extractMetadata } from './extract-metadata';
import { imageType, pngDimensions } from './metadata';

export interface LoadedPhoto {
  document: PhotoDocument;
  image: HTMLImageElement;
  previewImage?: ImageBitmap;
  dispose: () => void;
}

export async function loadPhoto(file: File): Promise<LoadedPhoto> {
  validateFileSize(file.size);
  const bytes = await file.arrayBuffer();
  const bytesView = new Uint8Array(bytes);
  const mimeType = imageType(bytesView);
  if (!mimeType) throw new Error('Please choose a valid JPG or PNG photo.');
  const extension = file.name.match(/\.([^.]+)$/u)?.[1]?.toLowerCase();
  if (
    (file.type && file.type !== mimeType) ||
    (extension &&
      !(
        (mimeType === 'image/jpeg' && ['jpg', 'jpeg'].includes(extension)) ||
        (mimeType === 'image/png' && extension === 'png')
      ))
  )
    throw new Error('The photo type does not match its file name or content.');
  const url = URL.createObjectURL(file);
  try {
    if (mimeType === 'image/png') {
      const dimensions = pngDimensions(bytesView);
      if (!dimensions) throw new Error('The PNG header is invalid.');
      validateImageSize(dimensions.width, dimensions.height);
    }
    const metadata = await extractMetadata(bytes);
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
    // The viewport does not need the full camera resolution. Keep the original
    // for export and let the browser prepare a smaller decoded preview.
    let previewImage: ImageBitmap | undefined;
    const previewScale = Math.min(
      1,
      2048 / Math.max(image.naturalWidth, image.naturalHeight),
    );
    if (previewScale < 1 && typeof createImageBitmap === 'function') {
      try {
        previewImage = await createImageBitmap(image, {
          resizeWidth: Math.max(
            1,
            Math.round(image.naturalWidth * previewScale),
          ),
          resizeHeight: Math.max(
            1,
            Math.round(image.naturalHeight * previewScale),
          ),
          resizeQuality: 'high',
        });
      } catch {
        // Browser resize support varies; the decoded original remains usable.
      }
    }
    return {
      image,
      previewImage,
      document: createPhotoDocument({
        name: file.name,
        mimeType,
        byteLength: file.size,
        dimensions: { width: image.naturalWidth, height: image.naturalHeight },
        metadata,
      }),
      dispose: () => {
        previewImage?.close();
        URL.revokeObjectURL(url);
      },
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    if (error instanceof PhotoLimitError) throw error;
    throw new Error('This photo could not be read. Try another JPG or PNG.', {
      cause: error,
    });
  }
}
