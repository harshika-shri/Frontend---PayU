export interface InvoiceUploadResponse {
  invoice_id: string | null;
  extraction_status: string | null;
  document_type: string;
  message: string;
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
