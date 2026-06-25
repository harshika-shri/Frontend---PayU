import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { TableSkeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { Pagination } from './Pagination';
import { SearchInput } from './SearchInput';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  loading?: boolean;
  error?: boolean;
  onPageChange?: (page: number) => void;
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  className?: string;
  headerActions?: React.ReactNode;
  rowKey?: (row: T) => string;
}

interface SortState {
  key: string;
  direction: 'asc' | 'desc';
}

export function DataTable<T extends object>({
  columns,
  data,
  total,
  page = 1,
  pageSize = 20,
  loading,
  error,
  onPageChange,
  onSortChange,
  onSearch,
  searchPlaceholder = 'Search…',
  emptyTitle = 'No results',
  emptyDescription,
  onRetry,
  className,
  headerActions,
  rowKey,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState | null>(null);
  const [search, setSearch] = useState('');

  const handleSort = (key: string) => {
    const newDir: 'asc' | 'desc' =
      sort?.key === key && sort.direction === 'asc' ? 'desc' : 'asc';
    setSort({ key, direction: newDir });
    onSortChange?.(key, newDir);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {(onSearch || headerActions) && (
        <div className="flex items-center justify-between gap-3">
          {onSearch && (
            <SearchInput
              value={search}
              onChange={handleSearch}
              onClear={() => { setSearch(''); onSearch(''); }}
              placeholder={searchPlaceholder}
              className="max-w-xs"
            />
          )}
          {headerActions && (
            <div className="flex items-center gap-2 ml-auto">{headerActions}</div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-[var(--color-border)] overflow-hidden bg-white">
        {loading ? (
          <TableSkeleton rows={5} cols={columns.length} />
        ) : error ? (
          <ErrorState onRetry={onRetry} className="py-12" />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-muted)]">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wide whitespace-nowrap',
                        col.sortable && 'cursor-pointer select-none hover:text-[var(--color-foreground)]',
                        col.headerClassName,
                      )}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {col.header}
                        {col.sortable && (
                          <span className="opacity-50">
                            {sort?.key === col.key ? (
                              sort.direction === 'asc' ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowDown className="h-3 w-3" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3 w-3" />
                            )}
                          </span>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length}>
                      <EmptyState title={emptyTitle} description={emptyDescription} />
                    </td>
                  </tr>
                ) : (
                  data.map((row, idx) => (
                    <tr
                      key={rowKey ? rowKey(row) : idx}
                      className="border-b border-[var(--color-border)] last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={cn(
                            'px-4 py-3.5 text-[var(--color-foreground)] whitespace-nowrap',
                            col.className,
                          )}
                        >
                          {col.render
                            ? col.render(row, idx)
                            : String((row as Record<string, unknown>)[col.key] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && !error && total != null && onPageChange && (
        <Pagination
          page={page}
          total={total}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
