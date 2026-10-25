import { createContext, useContext } from 'react';
import {
  oppositeMargin,
  type Margins,
  type MarginLinkMode,
} from '@/domain/sizing';

type Side = keyof Margins;
export const MarginPreviewContext = createContext<{
  active: Side | null;
  visible: boolean;
  hover: (side: Side | 'ruler' | null) => void;
  focus: (side: Side | null) => void;
  drag: (side: Side | null) => void;
} | null>(null);

export function useMarginPreview() {
  return useContext(MarginPreviewContext);
}

export function isMarginActive(
  side: Side,
  active: Side | null,
  mode: MarginLinkMode,
) {
  return (
    active !== null &&
    (side === active ||
      mode === 'all' ||
      (mode === 'pairs' && oppositeMargin[active] === side))
  );
}
