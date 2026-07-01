import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import {
  ArrowLeft,
  CheckCircle2,
  Save,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Badge } from '../../../components/ui/Badge';
import { PageSpinner } from '../../../components/ui/Spinner';
import { ErrorState } from '../../../components/ui/ErrorState';
import { DocumentViewer } from '../components/DocumentViewer';
import { ExtractionSection } from '../components/ExtractionSection';
import { ConfidenceField } from '../components/ConfidenceField';
import { LineItemsEditor } from '../components/LineItemsEditor';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import {
  useExtractionReview,
  useUpdateExtraction,
  useApproveExtraction,
} from '../hooks/useExtractionReview';
import { env } from '../../../config/env';
import type {
  BankDetailsReview,
  CompanyDetailsReview,
  ExtractionUpdateRequest,
  InvoiceHeaderReview,
  LineItemReview,
  VendorDetailsReview,
} from '../types/extraction.types';

export const ExtractionReviewPage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useExtractionReview(invoiceId ?? '');
  const updateMutation = useUpdateExtraction(invoiceId ?? '');
  const approveMutation = useApproveExtraction(invoiceId ?? '');

  // Local editable state — seeded from server data
  const [header, setHeader] = useState<InvoiceHeaderReview | null>(null);
  const [vendor, setVendor] = useState<VendorDetailsReview | null>(null);
  const [company, setCompany] = useState<CompanyDetailsReview | null>(null);
  const [bank, setBank] = useState<BankDetailsReview | null>(null);
  const [lineItems, setLineItems] = useState<LineItemReview[]>([]);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [docUrl, setDocUrl] = useState<string | undefined>();
  const [docFileType, setDocFileType] = useState<'pdf' | 'image' | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!invoiceId) return;

    const token = Cookies.get('access_token');

    fetch(`${env.docExtractionUrl}/invoices/${invoiceId}/document`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((response) => {
        if (!response.ok) return null;
        const contentType = response.headers.get('content-type') ?? '';
        if (contentType.includes('pdf')) {
          setDocFileType('pdf');
        } else if (contentType.startsWith('image/')) {
          setDocFileType('image');
        }
        return response.blob();
      })
      .then((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setDocUrl(url);
      })
      .catch(() => {
        setDocUrl(undefined);
        setDocFileType(null);
      });

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [invoiceId]);

  // Seed state when data loads
  useEffect(() => {
    if (!data) return;
    setHeader({ ...data.invoice_header });
    setVendor(data.vendor_details ? { ...data.vendor_details } : null);
    setCompany({ ...data.company_details });
    setBank(data.bank_details ? { ...data.bank_details } : null);
    setLineItems(data.line_items.map((l) => ({ ...l })));
  }, [data]);

  // Build confidence lookup: fieldName → { score, isFlagged }
  const confidenceMap = useMemo(() => {
    const m: Record<string, { score: number; flagged: boolean }> = {};
    data?.field_confidence_scores.forEach((f) => {
      m[f.field_name] = { score: f.confidence_score, flagged: f.is_flagged };
    });
    return m;
  }, [data]);

  const conf = (name: string) => confidenceMap[name];

  const flaggedCount = data?.field_confidence_scores.filter((f) => f.is_flagged).length ?? 0;

  // Dirty detection
  const isHeaderDirty = (key: keyof InvoiceHeaderReview) =>
    header?.[key] !== data?.invoice_header[key];
  const isVendorDirty = (key: keyof VendorDetailsReview) =>
    vendor?.[key] !== data?.vendor_details?.[key];
  const isCompanyDirty = (key: keyof CompanyDetailsReview) =>
    company?.[key] !== data?.company_details[key];
  const isBankDirty = (key: keyof BankDetailsReview) =>
    bank?.[key] !== data?.bank_details?.[key];

  const handleSave = async () => {
    const payload: ExtractionUpdateRequest = {
      invoice_header: header ?? undefined,
      vendor_details: vendor ?? undefined,
      company_details: company ?? undefined,
      bank_details: bank ?? undefined,
      line_items: lineItems.map((l) => ({
        line_number: l.line_number,
        item_code: l.item_code,
        item_description: l.item_description,
        uom: l.uom,
        quantity_billed: l.quantity_billed,
        unit_price: l.unit_price,
        discount_amount: l.discount_amount,
        line_total: l.line_total,
      })),
    };
    await updateMutation.mutateAsync(payload);
  };

  const handleApprove = async () => {
    setConfirmApprove(false);
    await approveMutation.mutateAsync();
    navigate('/invoices/processing');
  };

  // Helper — set nested state
  const setStr = <T extends object>(
    setter: React.Dispatch<React.SetStateAction<T | null>>,
    key: keyof T,
    value: string,
  ) =>
    setter((prev) =>
      prev ? { ...prev, [key]: value || null } : prev,
    );

  if (!invoiceId) {
    return (
      <ErrorState kind="notFound" title="No invoice selected" />
    );
  }

  if (isLoading) {
    return <PageSpinner />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        kind="generic"
        title="Failed to load extraction"
        description="Could not load the extraction data for this invoice."
        onRetry={() => refetch()}
      />
    );
  }

  const alreadyApproved = data.extraction_status === 'extraction_approved';

  return (
    <div className="flex flex-col h-[calc(100vh-56px-24px-24px)] min-h-0">
      {/* Sticky top bar */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(-1)}
            title="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-[var(--color-foreground)] truncate">
              Extraction Review
              {data.invoice_header.invoice_number && (
                <span className="text-[var(--color-muted-foreground)] font-normal ml-2">
                  · {data.invoice_header.invoice_number}
                </span>
              )}
            </h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <StatusBadge status={data.extraction_status} type="extraction" />
              {flaggedCount > 0 && (
                <Badge variant="warning" dot>
                  {flaggedCount} field{flaggedCount > 1 ? 's' : ''} need review
                </Badge>
              )}
              {alreadyApproved && (
                <Badge variant="success" dot>Approved</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            loading={updateMutation.isPending}
            leftIcon={<Save className="h-3.5 w-3.5" />}
          >
            Save Changes
          </Button>
          {!alreadyApproved && (
            <Button
              size="sm"
              leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
              onClick={() => setConfirmApprove(true)}
              loading={approveMutation.isPending}
            >
              Approve Extraction
            </Button>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-5 flex-1 min-h-0 overflow-hidden">
        {/* Left — Document Viewer (40%) */}
        <div className="w-[42%] flex-shrink-0 min-h-0">
          <DocumentViewer
            fileUrl={docUrl}
            fileType={docFileType}
            fitContainer
            className="h-full"
          />
        </div>

        {/* Right — Extracted Data (58%) */}
        <div className="flex-1 min-w-0 overflow-y-auto scrollbar-thin space-y-3 pb-4">
          {/* General Info */}
          <ExtractionSection
            title="General Information"
            defaultOpen
            flagCount={
              ['invoice_number', 'invoice_date', 'po_number', 'currency', 'payment_terms']
                .filter((k) => conf(k)?.flagged).length
            }
          >
            <div className="grid grid-cols-2 gap-4">
              {header && ([
                ['invoice_number', 'Invoice Number'],
                ['invoice_date', 'Invoice Date'],
                ['due_date', 'Due Date'],
                ['currency', 'Currency'],
                ['payment_terms', 'Payment Terms'],
              ] as [keyof InvoiceHeaderReview, string][]).map(([key, label]) => (
                <ConfidenceField
                  key={key}
                  label={label}
                  fieldName={key}
                  value={String(header[key] ?? '')}
                  confidence={conf(key)?.score}
                  isFlagged={conf(key)?.flagged}
                  isDirty={isHeaderDirty(key)}
                  onChange={(v) => setStr(setHeader, key, v)}
                />
              ))}
            </div>
            {header?.notes !== undefined && (
              <div className="mt-4">
                <ConfidenceField
                  label="Notes"
                  fieldName="notes"
                  value={String(header.notes ?? '')}
                  onChange={(v) => setStr(setHeader, 'notes', v)}
                  isDirty={isHeaderDirty('notes')}
                  multiline
                />
              </div>
            )}
          </ExtractionSection>

          {/* Amounts */}
          <ExtractionSection
            title="Amounts & Tax"
            defaultOpen
            flagCount={
              ['subtotal_amount', 'tax_amount', 'total_amount', 'discount_amount']
                .filter((k) => conf(k)?.flagged).length
            }
          >
            <div className="grid grid-cols-2 gap-4">
              {header && ([
                ['subtotal_amount', 'Subtotal'],
                ['tax_amount', 'Tax Amount'],
                ['discount_amount', 'Discount'],
                ['total_amount', 'Total Amount'],
              ] as [keyof InvoiceHeaderReview, string][]).map(([key, label]) => (
                <ConfidenceField
                  key={key}
                  label={label}
                  fieldName={key}
                  value={String(header[key] ?? '')}
                  confidence={conf(key)?.score}
                  isFlagged={conf(key)?.flagged}
                  isDirty={isHeaderDirty(key)}
                  onChange={(v) => setStr(setHeader, key, v)}
                />
              ))}
            </div>
          </ExtractionSection>

          {/* Vendor Information */}
          <ExtractionSection
            title="Vendor Information"
            flagCount={
              ['vendor_name', 'vendor_gstin', 'vendor_address', 'vendor_email', 'vendor_phone']
                .filter((k) => conf(k)?.flagged).length
            }
          >
            {vendor ? (
              <div className="grid grid-cols-2 gap-4">
                {([
                  ['vendor_name', 'Vendor Name'],
                  ['vendor_gstin', 'GSTIN'],
                  ['vendor_email', 'Email'],
                  ['vendor_phone', 'Phone'],
                ] as [keyof VendorDetailsReview, string][]).map(([key, label]) => (
                  <ConfidenceField
                    key={key}
                    label={label}
                    fieldName={key}
                    value={String(vendor[key] ?? '')}
                    confidence={conf(key)?.score}
                    isFlagged={conf(key)?.flagged}
                    isDirty={isVendorDirty(key)}
                    onChange={(v) => setStr(setVendor, key, v)}
                  />
                ))}
                <div className="col-span-2">
                  <ConfidenceField
                    label="Address"
                    fieldName="vendor_address"
                    value={String(vendor.vendor_address ?? '')}
                    confidence={conf('vendor_address')?.score}
                    isFlagged={conf('vendor_address')?.flagged}
                    isDirty={isVendorDirty('vendor_address')}
                    onChange={(v) => setStr(setVendor, 'vendor_address', v)}
                    multiline
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-muted-foreground)]">No vendor information extracted.</p>
            )}
          </ExtractionSection>

          {/* Buyer / Company */}
          <ExtractionSection
            title="Buyer Company"
            flagCount={
              ['company_name', 'company_gstin', 'company_address']
                .filter((k) => conf(k)?.flagged).length
            }
          >
            {company && (
              <div className="grid grid-cols-2 gap-4">
                <ConfidenceField
                  label="Company Name"
                  fieldName="company_name"
                  value={String(company.company_name ?? '')}
                  confidence={conf('buyer_company_name')?.score ?? conf('company_name')?.score}
                  isFlagged={conf('buyer_company_name')?.flagged ?? conf('company_name')?.flagged}
                  isDirty={isCompanyDirty('company_name')}
                  onChange={(v) => setStr(setCompany, 'company_name', v)}
                />
                <ConfidenceField
                  label="GSTIN"
                  fieldName="company_gstin"
                  value={String(company.company_gstin ?? '')}
                  confidence={conf('buyer_company_gstin')?.score ?? conf('company_gstin')?.score}
                  isFlagged={conf('buyer_company_gstin')?.flagged ?? conf('company_gstin')?.flagged}
                  isDirty={isCompanyDirty('company_gstin')}
                  onChange={(v) => setStr(setCompany, 'company_gstin', v)}
                />
                <div className="col-span-2">
                  <ConfidenceField
                    label="Address"
                    fieldName="company_address"
                    value={String(company.company_address ?? '')}
                    confidence={conf('buyer_company_address')?.score ?? conf('company_address')?.score}
                    isFlagged={conf('buyer_company_address')?.flagged ?? conf('company_address')?.flagged}
                    isDirty={isCompanyDirty('company_address')}
                    onChange={(v) => setStr(setCompany, 'company_address', v)}
                    multiline
                  />
                </div>
              </div>
            )}
          </ExtractionSection>

          {/* Bank Details */}
          {bank && (
            <ExtractionSection
              title="Bank Details"
              flagCount={
                ['bank_account_number', 'bank_name', 'ifsc_code', 'account_holder_name']
                  .filter((k) => conf(k)?.flagged).length
              }
            >
              <div className="grid grid-cols-2 gap-4">
                {([
                  ['bank_name', 'Bank Name'],
                  ['bank_account_number', 'Account Number'],
                  ['ifsc_code', 'IFSC Code'],
                  ['account_holder_name', 'Account Holder'],
                ] as [keyof BankDetailsReview, string][]).map(([key, label]) => (
                  <ConfidenceField
                    key={key}
                    label={label}
                    fieldName={key}
                    value={String(bank[key] ?? '')}
                    confidence={conf(key)?.score}
                    isFlagged={conf(key)?.flagged}
                    isDirty={isBankDirty(key)}
                    onChange={(v) => setStr(setBank, key, v)}
                  />
                ))}
              </div>
            </ExtractionSection>
          )}

          {/* Line Items */}
          <ExtractionSection title={`Line Items (${lineItems.length})`} defaultOpen={false}>
            <LineItemsEditor items={lineItems} onChange={setLineItems} />
          </ExtractionSection>

          {/* Bottom action strip */}
          {!alreadyApproved && (
            <div className="sticky bottom-0 bg-white border-t border-[var(--color-border)] px-4 py-3 -mx-4 flex items-center justify-between gap-3 mt-4">
              {flaggedCount > 0 && (
                <div className="flex items-center gap-2 text-xs text-[var(--color-warning-muted-foreground)]">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {flaggedCount} low-confidence field{flaggedCount > 1 ? 's' : ''} — review before approving
                </div>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  loading={updateMutation.isPending}
                  leftIcon={<Save className="h-3.5 w-3.5" />}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  onClick={() => setConfirmApprove(true)}
                  loading={approveMutation.isPending}
                >
                  Approve Extraction
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmApprove}
        onClose={() => setConfirmApprove(false)}
        onConfirm={handleApprove}
        loading={approveMutation.isPending}
        title="Approve this extraction?"
        description="This will mark the extraction as approved and automatically start the validation workflow. You can still edit the invoice later."
        confirmLabel="Approve"
      />
    </div>
  );
};
