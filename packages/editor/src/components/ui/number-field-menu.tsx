import { ChevronDown } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { ActionMenu, type ActionMenuItem } from './action-menu';
import { NumberField } from './number-field';

export function NumberFieldMenu({
  menuLabel,
  items,
  disabled,
  className,
  ...field
}: Omit<ComponentProps<typeof NumberField>, 'hideLabel' | 'hint'> & {
  menuLabel: string;
  items: readonly ActionMenuItem[];
}) {
  return (
    <div
      role="group"
      aria-label={field.label}
      className={cn(
        'control-button control-neutral control-height inline-flex min-w-0 items-stretch has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus-ring',
        className,
      )}
    >
      <NumberField
        {...field}
        hideLabel
        disabled={disabled}
        className="h-full min-w-0 flex-1 rounded-r-none border-0 bg-transparent shadow-none hover:bg-transparent has-[input:focus-visible]:shadow-none data-disabled:hover:bg-transparent [&>input]:w-auto [&>input]:flex-initial [&>input]:field-sizing-content [&>input]:tabular-nums [&>.numeric-steppers]:ml-auto"
      />
      <ActionMenu
        label={menuLabel}
        items={items}
        disabled={disabled || items.every((item) => item.disabled)}
        triggerIcon={<ChevronDown aria-hidden="true" />}
        triggerClassName="h-full min-h-0 w-8 min-w-8 rounded-l-none border-l border-button-border p-0"
      />
    </div>
  );
}
