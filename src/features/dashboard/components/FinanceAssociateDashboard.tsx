import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Upload } from 'lucide-react';
import { usePurchaseOrders } from '../../purchase-orders/hooks/usePurchaseOrders';

export const FinanceAssociateDashboard: React.FC = () => {
  const { data, isLoading } = usePurchaseOrders(1, 20);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const openCount = items.filter((po) => po.status === 'open').length;

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
          <Upload className="w-4 h-4" />
          Upload PO
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total POs</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{isLoading ? '—' : total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Open POs</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{isLoading ? '—' : openCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Other Status</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{isLoading ? '—' : total - openCount}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Recent Purchase Orders
          </h2>
          <Link to="/purchase-orders" className="text-xs text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        {isLoading ? (
          <div className="text-sm text-slate-500 py-4">Loading…</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center bg-white rounded-xl border border-slate-200">
            <FileText className="h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-500">No purchase orders uploaded yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">PO #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.slice(0, 5).map((po) => (
                  <tr key={po.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{po.po_number}</td>
                    <td className="px-4 py-3 text-slate-500">{po.po_date}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs capitalize">{po.status.replace(/_/g, ' ')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
