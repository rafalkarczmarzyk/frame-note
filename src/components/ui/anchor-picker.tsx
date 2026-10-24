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
      className="grid w-28 grid-cols-3 gap-1"
    >
      {anchorOptions.map((anchor) => {
        const Icon = anchorIcons[anchor];
        return (
          <button
            type="button"
            key={anchor}
            disabled={disabled}
            aria-label={anchor}
            aria-pressed={anchor === value}
            onClick={() => onValueChange(anchor)}
            className={cn(
              'flex h-8 items-center justify-center rounded-sm border text-lg outline-none hover:bg-secondary/20 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
              anchor === value && 'bg-primary text-primary-foreground',
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
