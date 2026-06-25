import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface ExtractionSectionProps {
  title: string;
  defaultOpen?: boolean;
  flagCount?: number;
  children: React.ReactNode;
}

export const ExtractionSection: React.FC<ExtractionSectionProps> = ({
  title,
  defaultOpen = true,
  flagCount = 0,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center justify-between px-4 py-3',
          'bg-[var(--color-muted)] hover:bg-slate-100 transition-colors',
          'text-sm font-medium text-[var(--color-foreground)]',
        )}
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="h-4 w-4 text-[var(--color-muted-foreground)]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[var(--color-muted-foreground)]" />
          )}
          {title}
          {flagCount > 0 && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--color-destructive-muted)] text-[var(--color-destructive)] ring-1 ring-inset ring-red-200">
              {flagCount} low confidence
            </span>
          )}
        </div>
      </button>

      {open && (
        <div className="px-4 py-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};
