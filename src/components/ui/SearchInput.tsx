import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  className?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onClear, ...props }, ref) => (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-3 h-4 w-4 text-[var(--color-muted-foreground)] pointer-events-none" />
      <input
        ref={ref}
        value={value}
        className={cn(
          'h-9 w-full rounded border border-[var(--color-border)] bg-white pl-9 pr-8 text-sm placeholder:text-[var(--color-muted-foreground)] shadow-[var(--shadow-xs)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:border-[var(--color-primary)]',
          'transition-colors',
        )}
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  ),
);

SearchInput.displayName = 'SearchInput';
