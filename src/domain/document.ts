import type { ImageAsset } from './inline-image';
import type { LogoContent } from './svg-asset';
import type { Margins, SizingUnit, MarginLinkMode } from './sizing';
import type { MetadataField } from './metadata';

export interface ImageDimensions {
  width: number;
  height: number;
}

/** Dimensions are those of the correctly oriented, decoded image. */
export interface Photo {
  name: string;
  mimeType: 'image/jpeg' | 'image/png';
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
  visible?: boolean;
  logo?: LogoContent;
  images?: ImageAsset[];
  template: string;
  sizingUnit: SizingUnit;
  style: {
    fontFamily: 'Montserrat Variable' | 'Advercase';
    fontWeight: 400 | 700;
    fontStyle?: 'normal' | 'italic';
    /** Uses the document sizing unit, never the viewport. */
    fontSize: number;
    color: string;
    opacity: number;
    /** Unitless multiplier of the font size. */
    lineHeight: number;
    textAlign: 'auto' | 'left' | 'center' | 'right';
  };
  position: {
    anchor: Anchor;
    /** Anchor reference point as percentages of the full photo. */
    custom?: { x: number; y: number };
    margins: Margins;
    marginLinkMode: MarginLinkMode;
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
    sizingUnit: 'short-edge',
    style: {
      fontFamily: 'Montserrat Variable',
      fontWeight: 400,
      fontSize: 2,
      color: 'porcelain',
      opacity: 1,
      lineHeight: 1.4,
      textAlign: 'auto',
    },
    position: {
      anchor: 'bottom-left',
      margins: { top: 3, right: 3, bottom: 3, left: 3 },
      marginLinkMode: 'none',
    },
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

/** Auto follows the retained anchor, including in Manual position mode. */
export function resolvedTextAlign(
  caption: Caption,
): 'left' | 'center' | 'right' {
  if (caption.style.textAlign !== 'auto') return caption.style.textAlign;
  const anchor = caption.position.anchor;
  return anchor.endsWith('left')
    ? 'left'
    : anchor.endsWith('right')
      ? 'right'
      : 'center';
}
