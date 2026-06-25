export interface InvoiceVendorSummary {
  vendor_name: string | null;
  vendor_code: string | null;
  gstin: string | null;
  email: string | null;
}

export interface InvoiceCompanySummary {
  company_name: string | null;
  company_code: string | null;
  gstin: string | null;
}

export interface InvoiceHeaderResponse {
  invoice_id: string;
  invoice_number: string | null;
  invoice_date: string | null;
  due_date: string | null;
  vendor: InvoiceVendorSummary | null;
  company: InvoiceCompanySummary | null;
  subtotal_amount: number | null;
  tax_amount: number | null;
  total_amount: number | null;
  payment_terms: string | null;
  notes: string | null;
  invoice_status: string | null;
  validation_outcome: string | null;
  received_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceEmailDetails {
  received_from: string | null;
  subject: string | null;
  body_text: string | null;
  attachment_filename: string | null;
}

export interface ExtractedVendorDetails {
  vendor_name: string | null;
  vendor_gstin: string | null;
  vendor_address: string | null;
  vendor_email: string | null;
  vendor_phone: string | null;
  bank_account_number: string | null;
  bank_name: string | null;
  ifsc_code: string | null;
  account_holder_name: string | null;
}

export interface InvoiceLineItemDetails {
  id: string;
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
  is_item_code_matched: boolean | null;
  is_unauthorized_extra_item: boolean | null;
  is_hsn_matched: boolean | null;
  is_line_total_correct: boolean | null;
  is_unit_price_matched: boolean | null;
  is_quantity_valid: boolean | null;
  is_uom_matched: boolean | null;
  is_tax_correct: boolean | null;
  created_at: string;
}

export interface ConfidenceScoreDetails {
  id: string;
  field_name: string;
  extracted_value: string | null;
  confidence_score: number;
  is_flagged: boolean;
  created_at: string;
}

export interface InvoiceExtractionResponse {
  email_details: InvoiceEmailDetails | null;
  vendor_details: ExtractedVendorDetails | null;
  line_items: InvoiceLineItemDetails[];
  confidence_scores: ConfidenceScoreDetails[];
}

export interface ValidationIssueDetails {
  id: string;
  check_stage: string;
  check_name: string;
  field_name: string | null;
  issue_type: string;
  expected_value: string | null;
  actual_value: string | null;
  description: string;
  status: string;
  metadata: Record<string, unknown> | null;
}

export interface ReviewSummaryDetails {
  decision: string;
  executive_summary: string;
  system_recoveries_json: unknown[];
  open_issues_json: unknown[];
  vendor_clarifications_json: unknown[];
  generated_at: string;
}

export interface InvoiceValidationResponse {
  validation_outcome: string | null;
  issues: ValidationIssueDetails[];
  review_summary: ReviewSummaryDetails | null;
}

export interface POCandidatePurchaseOrderDetails {
  po_id: string;
  po_number: string;
  status: string;
  total_amount: number | null;
  consumed_amount: number;
  po_date: string;
  vendor_name: string | null;
}

export interface POCandidateGroupDetails {
  id: string;
  candidate_type: string;
  confidence_score: number | null;
  is_selected: boolean;
  purchase_orders: POCandidatePurchaseOrderDetails[];
}

export interface POCandidateResponse {
  candidate_groups: POCandidateGroupDetails[];
}

export interface LineAllocationInvoiceLineDetails {
  item_code: string | null;
  item_description: string | null;
  quantity_billed: number;
  line_total: number;
}

export interface LineAllocationPOLineDetails {
  item_code: string | null;
  item_description: string;
  quantity_ordered: number;
  consumed_quantity: number;
  line_total: number;
}

export interface LineAllocationCandidateItemDetails {
  id: string;
  invoice_line_item_id: string;
  po_line_item_id: string;
  allocated_quantity: number;
  allocated_amount: number;
  candidate_type: string;
  invoice_line_item: LineAllocationInvoiceLineDetails;
  po_line_item: LineAllocationPOLineDetails;
}

export interface LineAllocationCandidateGroupDetails {
  id: string;
  candidate_type: string;
  confidence_score: number | null;
  is_selected: boolean;
  items: LineAllocationCandidateItemDetails[];
}

export interface LineAllocationCandidateResponse {
  candidate_groups: LineAllocationCandidateGroupDetails[];
}

export interface InvoiceWorkflowState {
  validation_outcome: string | null;
  invoice_status: string | null;
}

export interface InvoiceReviewResponse {
  workflow: InvoiceWorkflowState;
  header: InvoiceHeaderResponse;
  extraction: InvoiceExtractionResponse;
  validation: InvoiceValidationResponse;
  po_candidates: POCandidateResponse;
  line_allocation_candidates: LineAllocationCandidateResponse;
}
