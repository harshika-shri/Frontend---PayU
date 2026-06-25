import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { workflowService } from '../services/workflowService';
import { invoiceReviewKey } from './useInvoiceReview';
import { DASHBOARD_SUMMARY_KEY } from './useDashboard';
import type {
  ApproveInvoiceRequest,
  EscalateInvoiceRequest,
  RejectInvoiceRequest,
  SendClarificationRequest,
  SendRejectionEmailRequest,
  TakeOwnershipRequest,
} from '../types/workflow.types';

const errMsg = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? fallback;

export const useApproveInvoice = (invoiceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApproveInvoiceRequest) =>
      workflowService.approve(invoiceId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoiceReviewKey(invoiceId) });
      qc.invalidateQueries({ queryKey: DASHBOARD_SUMMARY_KEY });
      toast.success('Invoice approved successfully.');
    },
    onError: (err) => toast.error(errMsg(err, 'Unable to approve invoice. Please try again.')),
  });
};

export const useEscalateInvoice = (invoiceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EscalateInvoiceRequest) =>
      workflowService.escalate(invoiceId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoiceReviewKey(invoiceId) });
      qc.invalidateQueries({ queryKey: DASHBOARD_SUMMARY_KEY });
      toast.success('Invoice escalated to manager.');
    },
    onError: (err) => toast.error(errMsg(err, 'Unable to escalate invoice. Please try again.')),
  });
};

export const useGenerateClarificationDraft = (invoiceId: string) =>
  useMutation({
    mutationFn: () => workflowService.generateClarificationDraft(invoiceId),
    onError: (err) =>
      toast.error(errMsg(err, 'Unable to generate clarification draft.')),
  });

export const useSendClarification = (invoiceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendClarificationRequest) =>
      workflowService.sendClarification(invoiceId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoiceReviewKey(invoiceId) });
      toast.success('Clarification email sent to vendor.');
    },
    onError: (err) =>
      toast.error(errMsg(err, 'Unable to send clarification. Please try again.')),
  });
};

export const useRejectInvoice = (invoiceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RejectInvoiceRequest) =>
      workflowService.reject(invoiceId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoiceReviewKey(invoiceId) });
      qc.invalidateQueries({ queryKey: DASHBOARD_SUMMARY_KEY });
      toast.success('Invoice rejected.');
    },
    onError: (err) => toast.error(errMsg(err, 'Unable to reject invoice. Please try again.')),
  });
};

export const useGenerateRejectionDraft = (invoiceId: string) =>
  useMutation({
    mutationFn: () => workflowService.generateRejectionDraft(invoiceId),
    onError: (err) =>
      toast.error(errMsg(err, 'Unable to generate rejection draft.')),
  });

export const useSendRejection = (invoiceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendRejectionEmailRequest) =>
      workflowService.sendRejection(invoiceId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoiceReviewKey(invoiceId) });
      toast.success('Rejection email sent to vendor.');
    },
    onError: (err) =>
      toast.error(errMsg(err, 'Unable to send rejection email. Please try again.')),
  });
};

export const useTakeOwnership = (invoiceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TakeOwnershipRequest) =>
      workflowService.takeOwnership(invoiceId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoiceReviewKey(invoiceId) });
      toast.success('Invoice claimed. It is now in your queue.');
    },
    onError: (err) =>
      toast.error(errMsg(err, 'Unable to claim invoice. Please try again.')),
  });
};
