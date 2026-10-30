import type { ImageAsset } from '../../../../core/src/inline-image';
import canonSource from '@/assets/canon.svg?raw';
import { svgIcon } from './svg-icons';
import { brandIcons } from './brand-icons';

const frameNote = brandIcons.find((icon) => icon.name === 'framenote-logo')!;

const canon = svgIcon('canon', canonSource);

/** Built-in full-color graphics that can be inserted as inline images. */
export const builtinGraphics: readonly ImageAsset[] = [
  {
    id: 'framenote-logo',
    name: 'FrameNote logo',
    format: 'svg',
    source: frameNote.svg.replaceAll('currentColor', 'white'),
    width: frameNote.aspect,
    height: 1,
  },
  {
    id: 'canon-logo',
    name: 'Canon logo',
    format: 'svg',
    source: canon.svg,
    width: canon.aspect,
    height: 1,
  },
];
