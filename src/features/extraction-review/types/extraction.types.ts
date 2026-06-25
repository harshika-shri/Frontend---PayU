export interface InvoiceHeaderReview {
  invoice_number: string | null;
  invoice_date: string | null;
  po_numbers_extracted: string[] | null;
  due_date: string | null;
  currency: string | null;
  payment_terms: string | null;
  subtotal_amount: number | null;
  discount_amount: number | null;
  tax_amount: number | null;
  total_amount: number | null;
  notes: string | null;
}

export interface VendorDetailsReview {
  vendor_name: string | null;
  vendor_gstin: string | null;
  vendor_address: string | null;
  vendor_email: string | null;
  vendor_phone: string | null;
}

export interface CompanyDetailsReview {
  company_name: string | null;
  company_gstin: string | null;
  company_address: string | null;
}

export interface BankDetailsReview {
  bank_account_number: string | null;
  bank_name: string | null;
  ifsc_code: string | null;
  account_holder_name: string | null;
}

export interface LineItemReview {
  id: string | null;
  line_number: number;
  item_code: string | null;
  item_description: string | null;
  uom: string | null;
  quantity_billed: number;
  unit_price: number;
  discount_amount: number | null;
  tax_details: Record<string, unknown> | null;
  hsn_sac_code: string | null;
  line_total: number;
}

export interface FieldConfidenceScore {
  id: string;
  field_name: string;
  extracted_value: string | null;
  confidence_score: number;
  is_flagged: boolean;
}

export interface ExtractionReviewResponse {
  invoice_id: string;
  invoice_header: InvoiceHeaderReview;
  vendor_details: VendorDetailsReview | null;
  company_details: CompanyDetailsReview;
  bank_details: BankDetailsReview | null;
  line_items: LineItemReview[];
  field_confidence_scores: FieldConfidenceScore[];
  extraction_status: string;
}

export interface LineItemUpdate {
  line_number?: number | null;
  item_code?: string | null;
  item_description?: string | null;
  uom?: string | null;
  quantity_billed?: number | null;
  unit_price?: number | null;
  discount_amount?: number | null;
  tax_details?: Record<string, unknown> | null;
  hsn_sac_code?: string | null;
  line_total?: number | null;
}

export interface ExtractionUpdateRequest {
  invoice_header?: Partial<InvoiceHeaderReview> | null;
  vendor_details?: Partial<VendorDetailsReview> | null;
  company_details?: Partial<CompanyDetailsReview> | null;
  bank_details?: Partial<BankDetailsReview> | null;
  line_items?: LineItemUpdate[] | null;
}

export interface ExtractionApproveResponse {
  invoice_id: string;
  extraction_status: string;
  message: string;
}
