import type { LoadedPhoto } from './load-photo';

export async function photoThumbnail(photo: LoadedPhoto): Promise<string> {
  const { width, height } = photo.document.photo.dimensions;
  const scale = Math.min(1, 320 / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  try {
    const context = canvas.getContext('2d');
    if (!context) throw Error('Could not create a photo thumbnail.');
    context.drawImage(
      photo.previewImage ?? photo.image,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(Error('Could not create a photo thumbnail.')),
        'image/png',
      ),
    );
    return URL.createObjectURL(blob);
  } finally {
    canvas.width = canvas.height = 0;
  }
}
