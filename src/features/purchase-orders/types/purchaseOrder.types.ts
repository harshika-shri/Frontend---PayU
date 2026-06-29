export interface PurchaseOrderUploaderSummary {
  id: string;
  name: string;
  email: string;
}

export interface PurchaseOrderListItem {
  id: string;
  po_number: string;
  po_date: string;
  status: string;
  total_amount: number | null;
  currency: string;
  created_at: string | null;
  uploaded_by?: PurchaseOrderUploaderSummary | null;
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

export interface PurchaseOrderVendorSummary {
  vendor_name: string | null;
  vendor_code: string | null;
  gstin: string | null;
  email: string | null;
}

export interface PurchaseOrderCompanySummary {
  company_name: string | null;
  company_code: string | null;
  gstin: string | null;
}

export interface PurchaseOrderLineItemDetail {
  id: string;
  line_number: number;
  item_code: string | null;
  item_description: string;
  uom: string;
  quantity_ordered: number;
  unit_price: number;
  discount_amount: number | null;
  line_total: number;
  consumed_quantity: number;
}

export interface PurchaseOrderDetailResponse {
  id: string;
  po_number: string;
  po_date: string;
  valid_until: string | null;
  status: string;
  currency: string;
  payment_terms: string | null;
  delivery_address: string | null;
  subtotal_amount: number | null;
  discount_amount: number | null;
  tax_amount: number | null;
  total_amount: number | null;
  consumed_amount: number;
  created_at: string | null;
  updated_at: string | null;
  vendor: PurchaseOrderVendorSummary | null;
  company: PurchaseOrderCompanySummary | null;
  uploaded_by: PurchaseOrderUploaderSummary | null;
  line_items: PurchaseOrderLineItemDetail[];
}
