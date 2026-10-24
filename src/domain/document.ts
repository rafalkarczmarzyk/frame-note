import type { MetadataField } from './metadata';

export interface ImageDimensions {
  width: number;
  height: number;
}

/** Dimensions are those of the correctly oriented, decoded image. */
export interface Photo {
  name: string;
  mimeType: 'image/jpeg';
  byteLength: number;
  dimensions: ImageDimensions;
  metadata: readonly MetadataField[];
}

export type Anchor =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface Caption {
  template: string;
  style: {
    fontFamily: 'Montserrat Variable' | 'Advercase';
    fontWeight: 400 | 700;
    /** Percentage of the shorter image edge, not of the viewport. */
    fontSizePercent: number;
    color: string;
    opacity: number;
    /** Unitless multiplier of the font size. */
    lineHeight: number;
    textAlign: 'left' | 'center' | 'right';
  };
  position: {
    anchor: Anchor;
    /** Both margins are percentages of the shorter image edge. */
    marginXPercent: number;
    marginYPercent: number;
  };
}

/** Domain data only: File objects, object URLs and canvas nodes live in adapters. */
export interface PhotoDocument {
  photo: Photo;
  caption: Caption;
}

export function createCaption(): Caption {
  return {
    template: '',
    style: {
      fontFamily: 'Montserrat Variable',
      fontWeight: 400,
      fontSizePercent: 1.35,
      color: 'porcelain',
      opacity: 1,
      lineHeight: 1.4,
      textAlign: 'left',
    },
    position: { anchor: 'bottom-left', marginXPercent: 3, marginYPercent: 3 },
  };
}

export function createPhotoDocument(photo: Photo): PhotoDocument {
  const { width, height } = photo.dimensions;
  if (
    ![width, height].every((value) => Number.isSafeInteger(value) && value > 0)
  ) {
    throw new Error('Photo dimensions must be positive integer pixel counts.');
  }
  if (!Number.isSafeInteger(photo.byteLength) || photo.byteLength <= 0) {
    throw new Error('Photo byte length must be a positive integer.');
  }
  return {
    photo: {
      ...photo,
      dimensions: { ...photo.dimensions },
      metadata: photo.metadata.map((field) => ({ ...field })),
    },
    caption: createCaption(),
  };
}
