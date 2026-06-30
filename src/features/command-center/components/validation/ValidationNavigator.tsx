import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { ValidationSeverityIcon } from './ValidationIssueCard';

export type ValidationViewMode = 'step' | 'severity';

interface NavigatorItem {
  id: string;
  label: string;
  status: 'passed' | 'warning' | 'issues';
  issueCount: number;
  statusLabel: string;
}

interface ValidationNavigatorProps {
  items: NavigatorItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const ValidationNavigator: React.FC<ValidationNavigatorProps> = ({
  items,
  selectedId,
  onSelect,
}) => (
  <nav className="space-y-0.5" aria-label="Validation navigation">
    {items.map((item) => {
      const isSelected = item.id === selectedId;

      return (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={cn(
            'w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors',
            isSelected
              ? 'bg-white shadow-sm ring-1 ring-[var(--color-primary)]/20'
              : 'hover:bg-white/70',
          )}
        >
          <ValidationSeverityIcon status={item.status} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[var(--color-foreground)] truncate">
              {item.label}
            </p>
            <p
              className={cn(
                'text-[11px] mt-0.5',
                item.status === 'passed'
                  ? 'text-[var(--color-success)]'
                  : item.status === 'warning'
                  ? 'text-[var(--color-warning)]'
                  : 'text-[var(--color-destructive)]',
              )}
            >
              {item.statusLabel}
            </p>
          </div>
          <ChevronRight
            className={cn(
              'h-3.5 w-3.5 flex-shrink-0',
              isSelected
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--color-muted-foreground)]',
            )}
          />
        </button>
      );
    })}
  </nav>
);
