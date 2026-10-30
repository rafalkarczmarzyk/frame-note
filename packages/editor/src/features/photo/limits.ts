export const MAX_FILE_BYTES = 100_000_000;
export const MAX_IMAGE_PIXELS = 50_000_000;
export const MAX_IMAGE_EDGE = 16_384;

export class PhotoLimitError extends Error {}

export function validateFileSize(bytes: number): void {
  if (!Number.isSafeInteger(bytes) || bytes <= 0)
    throw new Error('This file is empty. Choose a JPG or PNG photo.');
  if (bytes > MAX_FILE_BYTES)
    throw new PhotoLimitError(
      'This photo exceeds the pre-MVP limit of 100 MB. Export a smaller JPG or PNG from your photo editor.',
    );
}
export function validateImageSize(width: number, height: number): void {
  if (
    ![width, height].every((value) => Number.isSafeInteger(value) && value > 0)
  )
    throw new Error('The photo has invalid dimensions.');
  if (
    width > MAX_IMAGE_EDGE ||
    height > MAX_IMAGE_EDGE ||
    width * height > MAX_IMAGE_PIXELS
  )
    throw new PhotoLimitError(
      'This photo exceeds the pre-MVP limit of 50 megapixels or 16384 pixels per edge. Export a smaller JPG or PNG.',
    );
}
