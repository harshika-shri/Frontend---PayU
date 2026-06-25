import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => (
  <nav aria-label="breadcrumb" className={cn('flex items-center', className)}>
    <ol className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <li key={idx} className="flex items-center gap-1">
            {idx > 0 && <ChevronRight className="h-3 w-3 flex-shrink-0" />}
            {isLast || !item.href ? (
              <span className={cn(isLast && 'font-medium text-[var(--color-foreground)]')}>
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="hover:text-[var(--color-foreground)] transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);
