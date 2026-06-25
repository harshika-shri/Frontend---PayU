import React from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = 'Select…',
  label,
  error,
  hint,
  disabled,
  className,
}) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    {label && (
      <label className="text-sm font-medium text-[var(--color-foreground)]">{label}</label>
    )}
    <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RadixSelect.Trigger
        className={cn(
          'flex h-9 w-full items-center justify-between rounded border border-[var(--color-border)] bg-white px-3 text-sm shadow-[var(--shadow-xs)] text-left transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:border-[var(--color-primary)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[placeholder]:text-[var(--color-muted-foreground)]',
          error && 'border-[var(--color-destructive)]',
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <ChevronDown className="h-4 w-4 text-[var(--color-muted-foreground)]" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          className="z-50 min-w-[8rem] overflow-hidden rounded-lg border border-[var(--color-border)] bg-white shadow-lg"
          position="popper"
          sideOffset={4}
        >
          <RadixSelect.Viewport className="p-1">
            {options.map((opt) => (
              <RadixSelect.Item
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className={cn(
                  'relative flex cursor-default select-none items-center rounded px-8 py-2 text-sm text-[var(--color-foreground)] outline-none',
                  'data-[highlighted]:bg-[var(--color-muted)] data-[highlighted]:text-[var(--color-foreground)]',
                  'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
                )}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  <RadixSelect.ItemIndicator>
                    <Check className="h-4 w-4 text-[var(--color-primary)]" />
                  </RadixSelect.ItemIndicator>
                </span>
                <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
    {error && <p className="text-xs text-[var(--color-destructive)]">{error}</p>}
    {hint && !error && <p className="text-xs text-[var(--color-muted-foreground)]">{hint}</p>}
  </div>
);
