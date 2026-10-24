import { createContext } from 'react';
import type { SvgIcon } from '../svg-icons';
export const TokenContext = createContext<{
  values: Record<string, string>;
  icons?: readonly SvgIcon[];
}>({
  values: {
    author: 'Alex Morgan',
    camera: 'Canon EOS R5',
    aperture: 'ƒ/8',
    'exif:Artist': 'Alex Morgan',
  },
});
