export interface DashboardSummary {
  ready_for_approval: number;
  needs_review: number;
  escalated: number;
  ready_to_pay: number;
  rejected: number;
  overdue: number;
  total: number;
}

export interface DashboardInvoiceListItem {
  invoice_id: string;
  invoice_number: string | null;
  invoice_date: string | null;
  due_date?: string | null;
  vendor_name: string | null;
  total_amount: number | null;
  validation_outcome: string | null;
  invoice_status: string | null;
  rejection_reason: string | null;
  escalated_to: string | null;
  assigned_manager_id: string | null;
  created_at: string;
}

export interface DashboardInvoiceListResponse {
  items: DashboardInvoiceListItem[];
  total_records: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  page: number;
}

export interface InvoiceListQueryParams {
  search?: string;
  invoice_status?: string;
  validation_outcome?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: string;
}

export type DashboardBucket =
  | 'ready-for-approval'
  | 'needs-review'
  | 'escalated'
  | 'ready-to-pay'
  | 'rejected'
  | 'overdue';
