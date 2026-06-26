export interface ReportSummaryResponse {
  total_invoices: number;
  under_review: number;
  ready_to_pay: number;
  rejected: number;
  escalated: number;
}

export interface ReportPerformanceResponse {
  avg_approval_time_hours: number;
  avg_rejection_time_hours: number;
}

export interface VendorSummaryItem {
  vendor_name: string;
  invoice_count: number;
}

export interface AssociateWorkloadItem {
  associate_name: string;
  under_review: number;
  approved: number;
  rejected: number;
  escalated: number;
}

export interface ManagerWorkloadItem {
  manager_name: string;
  escalated: number;
  claimed_unresolved: number;
  approved: number;
  rejected: number;
}

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  invoice_status?: string;
  validation_outcome?: string;
}
