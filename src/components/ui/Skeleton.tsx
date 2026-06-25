import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => (
  <div
    className={cn('animate-pulse rounded bg-slate-200', className)}
    {...props}
  />
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
      />
    ))}
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 5,
}) => (
  <div className="space-y-0">
    {/* Header */}
    <div className="flex gap-4 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-muted)]">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-3 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div
        key={rowIdx}
        className="flex gap-4 px-4 py-3.5 border-b border-[var(--color-border)]"
      >
        {Array.from({ length: cols }).map((_, colIdx) => (
          <Skeleton key={colIdx} className="h-4 flex-1" style={{ opacity: 1 - rowIdx * 0.12 }} />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg border border-[var(--color-border)] p-6 space-y-4">
    <Skeleton className="h-5 w-1/3" />
    <SkeletonText lines={3} />
  </div>
);
