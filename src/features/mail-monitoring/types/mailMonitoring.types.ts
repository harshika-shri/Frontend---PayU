export interface MonitoringStatusResponse {
  email_address: string;
  is_monitoring: boolean;
  last_processed_history_id: number | null;
}

export interface InvoiceProcessingItem {
  id: string;
  invoice_number: string | null;
  invoice_date: string | null;
  received_email: string | null;
  extraction_status: string;
  invoice_status: string | null;
  total_amount: number | null;
  currency: string | null;
  created_at: string | null;
}

export interface InvoiceProcessingListResponse {
  items: InvoiceProcessingItem[];
  total: number;
}
