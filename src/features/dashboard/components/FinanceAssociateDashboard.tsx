import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { usePurchaseOrders } from '../../purchase-orders/hooks/usePurchaseOrders';
import { PoStatusTable } from '../../purchase-orders/components/PoStatusTable';

export const FinanceAssociateDashboard: React.FC = () => {
  const { purchaseOrders, total, isLoading } = usePurchaseOrders();

  const openCount = purchaseOrders.filter((po) => po.status === 'open').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            View and track all purchase orders.
          </p>
        </div>
        <Link
          to="/purchase-orders"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 border border-transparent rounded-lg hover:bg-slate-800 transition-colors"
        >
          <FileText className="w-4 h-4" />
          Upload PO
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Total POs
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {isLoading ? '—' : total}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Open POs
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {isLoading ? '—' : openCount}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Other Status
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {isLoading ? '—' : total - openCount}
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            All Purchase Orders
          </h2>
          <span className="text-xs text-slate-500">{total} total</span>
        </div>
        <PoStatusTable purchaseOrders={purchaseOrders} isLoading={isLoading} />
      </div>
    </div>
  );
};
