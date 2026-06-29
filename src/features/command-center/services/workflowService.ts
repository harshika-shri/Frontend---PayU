import { commandCenterClient } from '../../../lib/commandCenterClient';
import type { ManagerSummary } from '../types/workflow.types';
import type {
  ApproveInvoiceRequest,
  ApproveInvoiceResponse,
  ClarificationDraftResponse,
  EscalateInvoiceRequest,
  EscalateInvoiceResponse,
  RejectInvoiceRequest,
  RejectInvoiceResponse,
  RejectionDraftResponse,
  SendClarificationRequest,
  SendClarificationResponse,
  SendRejectionEmailRequest,
  SendRejectionEmailResponse,
  TakeOwnershipRequest,
  TakeOwnershipResponse,
} from '../types/workflow.types';

export const workflowService = {
  approve: async (
    invoiceId: string,
    payload: ApproveInvoiceRequest,
  ): Promise<ApproveInvoiceResponse> => {
    const r = await commandCenterClient.post<ApproveInvoiceResponse>(
      `/invoices/${invoiceId}/approve`,
      payload,
    );
    return r.data;
  },

  escalate: async (
    invoiceId: string,
    payload: EscalateInvoiceRequest,
  ): Promise<EscalateInvoiceResponse> => {
    const r = await commandCenterClient.post<EscalateInvoiceResponse>(
      `/invoices/${invoiceId}/escalate`,
      payload,
    );
    return r.data;
  },

  generateClarificationDraft: async (
    invoiceId: string,
  ): Promise<ClarificationDraftResponse> => {
    const r = await commandCenterClient.post<ClarificationDraftResponse>(
      `/invoices/${invoiceId}/clarification-draft`,
    );
    return r.data;
  },

  sendClarification: async (
    invoiceId: string,
    payload: SendClarificationRequest,
  ): Promise<SendClarificationResponse> => {
    const r = await commandCenterClient.post<SendClarificationResponse>(
      `/invoices/${invoiceId}/clarification-send`,
      payload,
    );
    return r.data;
  },

  reject: async (
    invoiceId: string,
    payload: RejectInvoiceRequest,
  ): Promise<RejectInvoiceResponse> => {
    const r = await commandCenterClient.post<RejectInvoiceResponse>(
      `/invoices/${invoiceId}/reject`,
      payload,
    );
    return r.data;
  },

  generateRejectionDraft: async (
    invoiceId: string,
  ): Promise<RejectionDraftResponse> => {
    const r = await commandCenterClient.post<RejectionDraftResponse>(
      `/invoices/${invoiceId}/rejection-draft`,
    );
    return r.data;
  },

  sendRejection: async (
    invoiceId: string,
    payload: SendRejectionEmailRequest,
  ): Promise<SendRejectionEmailResponse> => {
    const r = await commandCenterClient.post<SendRejectionEmailResponse>(
      `/invoices/${invoiceId}/rejection-send`,
      payload,
    );
    return r.data;
  },

  takeOwnership: async (
    invoiceId: string,
    payload: TakeOwnershipRequest,
  ): Promise<TakeOwnershipResponse> => {
    const r = await commandCenterClient.post<TakeOwnershipResponse>(
      `/invoices/${invoiceId}/take-ownership`,
      payload,
    );
    return r.data;
  },

  listManagers: async (): Promise<ManagerSummary[]> => {
    const r = await commandCenterClient.get<ManagerSummary[]>('/users/managers');
    return r.data;
  },
};
