import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { useUploadPurchaseOrder } from '../hooks/useUploadPurchaseOrder';
import { PoUploadCard } from './PoUploadCard';

export const PurchaseOrdersView: React.FC = () => {
  const { isUploading, uploadPurchaseOrder } = useUploadPurchaseOrder();

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-slate-500" />
          Upload Purchase Orders
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload a PO document. View status and track progress from your dashboard.
        </p>
      </div>

      <PoUploadCard onUpload={uploadPurchaseOrder} isUploading={isUploading} />
    </div>
  );
};
