import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileBarChart2,
  Building2,
  Users,
  UserCog,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';

const REPORT_CARDS = [
  {
    id: 'summary',
    title: 'Invoice Summary',
    description: 'Overview of invoice volumes, statuses, and pipeline health.',
    icon: <FileBarChart2 className="h-5 w-5 text-[var(--color-primary)]" />,
    iconBg: 'bg-[var(--color-primary-muted)]',
    href: '/reports/summary',
  },
  {
    id: 'vendor',
    title: 'Vendor Performance',
    description: 'Invoice counts and trends per vendor.',
    icon: <Building2 className="h-5 w-5 text-[var(--color-info)]" />,
    iconBg: 'bg-[var(--color-info-muted)]',
    href: '/reports/vendor',
  },
  {
    id: 'associate',
    title: 'Associate Performance',
    description: 'Workload and resolution rates per Finance Associate.',
    icon: <Users className="h-5 w-5 text-[var(--color-success)]" />,
    iconBg: 'bg-[var(--color-success-muted)]',
    href: '/reports/associate',
  },
  {
    id: 'manager',
    title: 'Manager Performance',
    description: 'Escalation handling and outcomes per Finance Manager.',
    icon: <UserCog className="h-5 w-5 text-[var(--color-warning)]" />,
    iconBg: 'bg-[var(--color-warning-muted)]',
    href: '/reports/manager',
  },
  {
    id: 'processing',
    title: 'Processing Statistics',
    description: 'Average approval and rejection times across the platform.',
    icon: <Cpu className="h-5 w-5 text-slate-500" />,
    iconBg: 'bg-slate-100',
    href: '/reports/processing',
  },
] as const;

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Analytics and workload insights across the finance platform."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-w-4xl">
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
              View report <ArrowRight className="h-3 w-3" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
