import type { ImageAsset } from '../../../../../core/src/inline-image';
import { createContext } from 'react';
import type { SvgIcon } from '../svg-icons';
export const TokenContext = createContext<{
  images?: readonly ImageAsset[];
  selectedImagePosition?: number | null;
  values: Record<string, string>;
  hasPhoto?: boolean;
  icons?: readonly SvgIcon[];
}>({
  values: {
    author: 'Alex Morgan',
    camera: 'Canon EOS R5',
    aperture: 'ƒ/8',
    'exif:Artist': 'Alex Morgan',
  },
});
