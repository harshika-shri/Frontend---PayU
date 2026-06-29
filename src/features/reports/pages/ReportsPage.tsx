import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Users, ArrowRight } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';

const REPORT_CARDS = [
  {
    id: 'invoices',
    title: 'Invoice Processing Report',
    description:
      'Comprehensive invoice data with powerful filtering across status, validation, vendor, and workflow fields.',
    icon: <FileSpreadsheet className="h-5 w-5 text-[var(--color-primary)]" />,
    iconBg: 'bg-[var(--color-primary-muted)]',
    href: '/reports/invoices',
  },
  {
    id: 'finance-associates',
    title: 'Finance Associate Performance',
    description:
      'Associate-centric workload, approval outcomes, and resolution metrics with Excel export.',
    icon: <Users className="h-5 w-5 text-[var(--color-success)]" />,
    iconBg: 'bg-[var(--color-success-muted)]',
    href: '/reports/finance-associates',
  },
] as const;

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Historical analysis and data export for finance operations."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
        {REPORT_CARDS.map((card) => (
          <button
            key={card.id}
            onClick={() => navigate(card.href)}
            className="group text-left rounded-lg border border-[var(--color-border)] bg-white p-5 hover:shadow-[var(--shadow-sm)] hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg} flex-shrink-0`}
              >
                {card.icon}
              </div>
            </div>
            <p className="text-sm font-semibold text-[var(--color-foreground)]">{card.title}</p>
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)] leading-relaxed">
              {card.description}
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
              Open report <ArrowRight className="h-3 w-3" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
