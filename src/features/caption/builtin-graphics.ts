import type { ImageAsset } from '@/domain/inline-image';
import canonSource from '@/assets/canon.svg?raw';
import { svgIcon } from './svg-icons';

const canon = svgIcon('canon', canonSource);

/** Built-in full-color graphics that can be inserted as inline images. */
export const builtinGraphics: readonly ImageAsset[] = [
  {
    id: 'canon-logo',
    name: 'Canon logo',
    format: 'svg',
    source: canon.svg,
    width: canon.aspect,
    height: 1,
  },
];
