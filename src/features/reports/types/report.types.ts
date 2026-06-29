export interface ReportFilterOption {
  value: string;
  label: string;
}

export interface VendorOption {
  id: string;
  vendor_name: string;
}

export interface FinanceAssociateOption {
  id: string;
  name: string;
}

export interface ReportFilterOptionsResponse {
  vendors: VendorOption[];
  finance_associates: FinanceAssociateOption[];
  invoice_statuses: ReportFilterOption[];
  validation_outcomes: ReportFilterOption[];
  validation_nodes: ReportFilterOption[];
  issue_severities: ReportFilterOption[];
  overdue_options: ReportFilterOption[];
}

export interface InvoiceReportFilters {
  from_date?: string;
  to_date?: string;
  invoice_status?: string;
  validation_outcome?: string;
  vendor_id?: string;
  finance_associate_id?: string;
  validation_node?: string;
  issue_severity?: string;
  overdue?: string;
  po_number?: string;
  invoice_number?: string;
}

export interface InvoiceReportQuery extends InvoiceReportFilters {
  search?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface InvoiceReportItem {
  invoice_id: string;
  invoice_number: string | null;
  invoice_date: string | null;
  due_date: string | null;
  invoice_status: string | null;
  validation_outcome: string | null;
  total_amount: number | null;
  tax_amount: number | null;
  currency: string | null;
  vendor_name: string | null;
  vendor_gstin: string | null;
  vendor_email: string | null;
  company_name: string | null;
  po_number: string | null;
  po_date: string | null;
  po_status: string | null;
  assigned_finance_associate: string | null;
  assigned_finance_manager: string | null;
  resolution_type: string | null;
  validation_issue_count: number;
  highest_issue_severity: string | null;
  workflow_status: string | null;
  approved_by: string | null;
  rejected_by: string | null;
  escalated_by: string | null;
}

export interface InvoiceReportListResponse {
  items: InvoiceReportItem[];
  page: number;
  page_size: number;
  total_records: number;
}

export type AssociateReportViewMode = 'overall' | 'daywise';

export interface AssociateReportFilters {
  from_date?: string;
  to_date?: string;
  finance_associate_id?: string;
  view_mode?: AssociateReportViewMode;
}

export interface AssociateReportQuery extends AssociateReportFilters {
  search?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface FinanceAssociatePerformanceItem {
  associate_id: string;
  associate_name: string;
  report_date?: string | null;
  total_assigned: number;
  approved: number;
  rejected: number;
  needs_review: number;
  ready_for_approval: number;
  ready_to_pay: number;
  overdue: number;
  escalated: number;
  resolved_count: number;
  recovered_count: number;
  approval_rate: number;
  rejection_rate: number;
}

export interface FinanceAssociatePerformanceListResponse {
  items: FinanceAssociatePerformanceItem[];
  page: number;
  page_size: number;
  total_records: number;
}
