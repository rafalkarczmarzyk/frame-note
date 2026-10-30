import {
  marginSides,
  type Margins,
  type MarginLinkMode,
} from '../../../../core/src/sizing';
import { isMarginActive } from './margin-preview-context';
export interface MarginGuidesProps {
  width: number;
  height: number;
  positions: Margins;
  active?: keyof Margins | null;
  linkMode?: MarginLinkMode;
}
/** Full-image guides in display pixels, independent of document units. */
export function MarginGuides({
  width,
  height,
  positions,
  active = null,
  linkMode = 'none',
}: MarginGuidesProps) {
  return (
    <svg
      width={width}
      height={height}
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
    >
      {marginSides.map((side) => {
        const horizontal = side === 'top' || side === 'bottom';
        const d = horizontal
          ? `M0 ${positions[side]} H${width}`
          : `M${positions[side]} 0 V${height}`;
        return (
          <g
            key={side}
            className={
              isMarginActive(side, active, linkMode)
                ? 'text-accent-color'
                : 'text-content-primary'
            }
          >
            <path d={d} className="stroke-workspace-base" strokeWidth="3" />
            <path d={d} stroke="currentColor" strokeWidth="1" />
          </g>
        );
      })}
    </svg>
  );
}
