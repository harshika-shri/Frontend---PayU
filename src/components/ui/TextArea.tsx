import React from 'react';
import { cn } from '../../utils/cn';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-foreground)]"
          >
            {label}
            {props.required && <span className="text-[var(--color-destructive)] ml-0.5">*</span>}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            'flex min-h-[80px] w-full rounded border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] shadow-[var(--shadow-xs)] transition-colors resize-y',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:border-[var(--color-primary)]',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-muted)]',
            error && 'border-[var(--color-destructive)] focus:ring-[var(--color-destructive)]',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--color-destructive)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--color-muted-foreground)]">{hint}</p>}
      </div>
    );
  },
);

TextArea.displayName = 'TextArea';
