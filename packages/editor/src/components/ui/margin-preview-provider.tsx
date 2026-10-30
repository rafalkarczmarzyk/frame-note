import { useState, type ReactNode } from 'react';
import type { Margins } from '../../../../core/src/sizing';
import { MarginPreviewContext } from './margin-preview-context';
type Side = keyof Margins;
export function MarginPreviewProvider({ children }: { children: ReactNode }) {
  const [hovered, hover] = useState<Side | 'ruler' | null>(null);
  const [focused, focus] = useState<Side | null>(null);
  const [dragged, drag] = useState<Side | null>(null);
  return (
    <MarginPreviewContext.Provider
      value={{
        active: dragged ?? focused ?? (hovered === 'ruler' ? null : hovered),
        visible: dragged !== null || focused !== null || hovered !== null,
        drag,
        hover,
        focus,
      }}
    >
      {children}
    </MarginPreviewContext.Provider>
  );
}
