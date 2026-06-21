export interface PurchaseOrderListItem {
  id: string;
  po_number: string;
  po_date: string;
  status: string;
  total_amount: number | null;
  currency: string;
  created_at: string | null;
}

export interface PurchaseOrderListResponse {
  items: PurchaseOrderListItem[];
  total: number;
}

export interface PurchaseOrderUploadResponse {
  id: string;
  po_number: string;
  po_date: string;
  status: string;
  gcs_file_path: string;
  line_items_saved: number;
}
