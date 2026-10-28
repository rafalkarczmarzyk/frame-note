import { Tooltip } from './tooltip';
import type { ComponentProps, ReactNode } from 'react';
import { ChevronDown, LoaderCircle } from 'lucide-react';
import { Button } from './button';
import { ActionMenu, type ActionMenuItem } from './action-menu';
import { cn } from '@/lib/utils';

export interface SplitButtonProps extends Omit<
  ComponentProps<typeof Button>,
  'asChild' | 'children'
> {
  children: ReactNode;
  /** Accessible name of the secondary menu trigger. */
  menuLabel: string;
  items: readonly ActionMenuItem[];
  primaryDisabled?: boolean;
  menuDisabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  primaryTooltip?: string;
}

/** A primary action with a separate, attached menu of secondary actions. */
export function SplitButton({
  children,
  menuLabel,
  items,
  variant = 'default',
  size = 'default',
  color = 'default',
  disabled = false,
  primaryDisabled = false,
  menuDisabled = false,
  loading = false,
  fullWidth = false,
  className,
  primaryTooltip,
  ...props
}: SplitButtonProps) {
  return (
    <div
      role="group"
      aria-label={props['aria-label'] ?? menuLabel}
      className={cn(
        'inline-flex min-w-0 shrink-0 items-stretch',
        fullWidth && 'w-full [&>[data-tooltip-trigger-wrapper]]:flex-1',
        className,
      )}
    >
      <Tooltip
        wrapTrigger={!!primaryTooltip}
        disabled={!primaryTooltip}
        content={primaryTooltip}
        disabledTrigger={
          !!primaryTooltip && (disabled || primaryDisabled || loading)
        }
      >
        <Button
          {...props}
          variant={variant}
          size={size}
          color={color}
          disabled={disabled || primaryDisabled || loading}
          aria-busy={loading || undefined}
          className={cn('min-w-0 rounded-r-none', fullWidth && 'flex-1')}
        >
          {loading && (
            <LoaderCircle
              className="animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}
          {children}
        </Button>
      </Tooltip>
      <ActionMenu
        label={menuLabel}
        items={items}
        disabled={disabled || menuDisabled || loading || !items.length}
        triggerIcon={<ChevronDown aria-hidden="true" />}
        triggerAppearance={{ variant, size, color }}
        triggerClassName={cn(
          'shrink-0 rounded-l-none border-l border-border-subtle px-0 py-0',
          'w-10',
        )}
      />
    </div>
  );
}
