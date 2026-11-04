import { builtinPresets } from '../../domain/builtin-presets';
import type { CaptionLayout } from '../../../../core/src/caption-layout';
import { builtinIcons } from '../caption/builtin-icons';
import type { SvgIcon } from '@/features/caption/svg-icons';

export interface EditOptions {
  label?: string;
  group?: string;
  gesture?: boolean;
  targetId?: string;
  viewOnly?: boolean;
  selectionBefore?: Omit<EditorSelection, 'layerId'>;
  selectionAfter?: Omit<EditorSelection, 'layerId'>;
}
export interface EditorSelection {
  node?: boolean;
  layerId: string;
  from: number;
  to: number;
}

export interface SessionDocument {
  selection?: EditorSelection;
  layout: CaptionLayout;
  icons: SvgIcon[];
  presetId: string;
}

export function defaultSessionDocument(): SessionDocument {
  return {
    layout: structuredClone(builtinPresets[0]!.layout),
    icons: [...builtinIcons],
    presetId: 'builtin-default',
  };
}
