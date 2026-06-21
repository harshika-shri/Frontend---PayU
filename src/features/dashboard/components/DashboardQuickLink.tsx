import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface DashboardQuickLinkProps {
  to: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const DashboardQuickLink: React.FC<DashboardQuickLinkProps> = ({
  to,
  title,
  description,
  icon,
}) => (
  <Link
    to={to}
    className="group bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 hover:shadow transition-all"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all mt-1 flex-shrink-0" />
    </div>
  </Link>
);
