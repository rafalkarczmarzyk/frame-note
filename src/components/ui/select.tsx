import { Fragment } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  separatorBefore?: boolean;
}
export interface SelectProps {
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly SelectOption[];
  disabled?: boolean;
  placeholder?: string;
}

export function Select({
  value,
  onValueChange,
  options,
  disabled,
  placeholder = 'Select…',
  ...props
}: SelectProps) {
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        {...props}
        className="control-field flex h-9 w-full min-w-0 items-center justify-between gap-2 px-3 text-left text-xs"
      >
        <SelectPrimitive.Value
          data-tooltip-truncate
          className="block min-w-0 truncate"
          placeholder={placeholder}
        />
        <SelectPrimitive.Icon>
          <ChevronDown className="size-3.5 shrink-0" aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={5}
          className="z-[100] max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)] control-menu overflow-y-auto p-1.5 text-menu-text"
        >
          <SelectPrimitive.Viewport>
            {options.map((option, index) => (
              <Fragment key={option.value}>
                {option.separatorBefore && index > 0 && (
                  <SelectPrimitive.Separator className="my-1 border-t border-panel-border" />
                )}
                <SelectPrimitive.Item
                  value={option.value}
                  disabled={option.disabled}
                  className="control-option relative flex cursor-pointer select-none items-center rounded-md py-2 pr-8 pl-3 text-xs outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40"
                >
                  <SelectPrimitive.ItemText>
                    {option.label}
                  </SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="absolute right-2">
                    <Check className="size-3.5" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              </Fragment>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
