import { Tooltip } from './tooltip';
import {
  ArrowUpLeft,
  ArrowUp,
  ArrowUpRight,
  ArrowLeft,
  Dot,
  ArrowRight,
  ArrowDownLeft,
  ArrowDown,
  ArrowDownRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const anchorOptions = [
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center',
  'center-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const;
export type AnchorValue = (typeof anchorOptions)[number];
const anchorIcons = {
  'top-left': ArrowUpLeft,
  'top-center': ArrowUp,
  'top-right': ArrowUpRight,
  'center-left': ArrowLeft,
  center: Dot,
  'center-right': ArrowRight,
  'bottom-left': ArrowDownLeft,
  'bottom-center': ArrowDown,
  'bottom-right': ArrowDownRight,
} satisfies Record<AnchorValue, typeof ArrowUp>;

export function AnchorPicker({
  value,
  onValueChange,
  disabled = false,
}: {
  value: AnchorValue;
  onValueChange: (value: AnchorValue) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label="Caption anchor"
      className="control-segments anchor-picker grid w-32 grid-cols-3 gap-1 p-1"
    >
      {anchorOptions.map((anchor) => {
        const Icon = anchorIcons[anchor];
        return (
          <Tooltip
            key={anchor}
            content={anchor
              .replaceAll('-', ' ')
              .replace(/^./, (c) => c.toUpperCase())}
          >
            <button
              type="button"
              disabled={disabled}
              aria-label={anchor}
              aria-pressed={anchor === value}
              onClick={() => onValueChange(anchor)}
              className={cn(
                'control-segment flex h-9 items-center justify-center text-lg',
                anchor === value && 'control-selected',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}

export function AnchorIcon({
  value,
  className,
}: {
  value: AnchorValue;
  className?: string;
}) {
  const Icon = anchorIcons[value];
  return <Icon aria-hidden="true" className={className} />;
}
