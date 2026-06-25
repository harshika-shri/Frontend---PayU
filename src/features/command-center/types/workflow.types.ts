// Approval
export interface ApproveInvoiceRequest {
  approved_by: string;
  comments?: string | null;
}
export interface ApproveInvoiceResponse {
  invoice_id: string;
  invoice_status: string;
  message: string;
}

// Escalation
export interface EscalateInvoiceRequest {
  escalated_by: string;
  manager_id: string;
  reason: string;
}
export interface EscalateInvoiceResponse {
  invoice_id: string;
  invoice_status: string;
  escalated_to: string;
  message: string;
}

// Clarification draft
export interface ClarificationDraftResponse {
  invoice_id: string;
  vendor_email: string | null;
  subject: string;
  body: string;
  clarification_points: string[];
}
export interface SendClarificationRequest {
  sent_by: string;
  subject: string;
  body: string;
}
export interface SendClarificationResponse {
  invoice_id: string;
  dispute_id: string;
  communication_id: string;
  vendor_email: string;
  message: string;
}

// Rejection
export interface RejectInvoiceRequest {
  rejected_by: string;
  rejection_reason: string;
}
export interface RejectInvoiceResponse {
  invoice_id: string;
  invoice_status: string;
  message: string;
}
export interface RejectionDraftResponse {
  invoice_id: string;
  vendor_email: string | null;
  subject: string;
  body: string;
  issues: string[];
}
export interface SendRejectionEmailRequest {
  sent_by: string;
  subject: string;
  body: string;
}
export interface SendRejectionEmailResponse {
  invoice_id: string;
  communication_id: string;
  vendor_email: string;
  message: string;
}

// Ownership
export interface TakeOwnershipRequest {
  manager_id: string;
}
export interface TakeOwnershipResponse {
  invoice_id: string;
  assigned_manager_id: string;
  message: string;
}
