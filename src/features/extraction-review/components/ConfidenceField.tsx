import React from 'react';
import { cn } from '../../../utils/cn';

interface ConfidenceFieldProps {
  label: string;
  fieldName: string;
  value: string;
  confidence?: number;
  isFlagged?: boolean;
  onChange: (value: string) => void;
  isDirty?: boolean;
  multiline?: boolean;
  readOnly?: boolean;
}

function confidenceTier(score: number): 'high' | 'medium' | 'low' {
  if (score >= 85) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}

const tierConfig = {
  high: {
    dot: 'bg-[var(--color-success)]',
    text: 'text-[var(--color-success-muted-foreground)]',
    bg: 'bg-[var(--color-success-muted)]',
    ring: 'ring-green-200',
    label: 'High',
  },
  medium: {
    dot: 'bg-[var(--color-warning)]',
    text: 'text-[var(--color-warning-muted-foreground)]',
    bg: 'bg-[var(--color-warning-muted)]',
    ring: 'ring-amber-200',
    label: 'Medium',
  },
  low: {
    dot: 'bg-[var(--color-destructive)]',
    text: 'text-[var(--color-destructive-muted-foreground)]',
    bg: 'bg-[var(--color-destructive-muted)]',
    ring: 'ring-red-200',
    label: 'Low',
  },
};

export const ConfidenceField: React.FC<ConfidenceFieldProps> = ({
  label,
  value,
  confidence,
  isFlagged,
  onChange,
  isDirty,
  multiline,
  readOnly,
}) => {
  const tier = confidence != null ? confidenceTier(confidence) : null;
  const config = tier ? tierConfig[tier] : null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">
          {label}
        </label>
        <div className="flex items-center gap-1.5">
          {isDirty && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-accent)] text-[var(--color-accent-foreground)] font-medium border border-blue-200">
              Modified
            </span>
          )}
          {config && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset',
                config.bg,
                config.text,
                config.ring,
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
              {config.label}
              {confidence != null && ` · ${Math.round(confidence)}%`}
              {isFlagged && ' ⚑'}
            </span>
          )}
        </div>
      </div>

      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          rows={3}
          className={cn(
            'flex w-full resize-none rounded border bg-white px-3 py-2 text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:border-[var(--color-primary)]',
            isDirty
              ? 'border-[var(--color-primary)] bg-[var(--color-primary-muted)]'
              : isFlagged
              ? 'border-[var(--color-destructive)] bg-[var(--color-destructive-muted)]'
              : 'border-[var(--color-border)]',
            readOnly && 'cursor-default bg-[var(--color-muted)] opacity-70',
          )}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          className={cn(
            'flex h-9 w-full rounded border bg-white px-3 text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:border-[var(--color-primary)]',
            isDirty
              ? 'border-[var(--color-primary)] bg-[var(--color-primary-muted)]'
              : isFlagged
              ? 'border-[var(--color-destructive)] bg-[var(--color-destructive-muted)]'
              : 'border-[var(--color-border)]',
            readOnly && 'cursor-default bg-[var(--color-muted)] opacity-70',
          )}
        />
      )}
    </div>
  );
};
