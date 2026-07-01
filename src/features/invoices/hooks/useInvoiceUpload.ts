import { useMutation, useMutationState } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  beginInvoiceUploadAbort,
  cancelInvoiceUploadAbort,
  clearInvoiceUploadAbort,
} from '../../../lib/uploadAbortRegistry';
import { invoiceService } from '../services/invoiceService';
import type { InvoiceUploadResponse } from '../types/invoice.types';

export const INVOICE_UPLOAD_MUTATION_KEY = ['invoice', 'upload'] as const;

export const useInvoiceUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation<InvoiceUploadResponse, unknown, File>({
    mutationKey: INVOICE_UPLOAD_MUTATION_KEY,
    mutationFn: (file: File) =>
      invoiceService.uploadInvoice(
        file,
        setUploadProgress,
        beginInvoiceUploadAbort(),
      ),
    onMutate: () => {
      toast.loading('Processing invoice upload…', { id: 'invoice-upload' });
    },
    onSuccess: (data) => {
      toast.dismiss('invoice-upload');

      if (data.document_type !== 'invoice') {
        toast.error(
          `Document classified as "${data.document_type}", not an invoice. Please upload an invoice document.`,
          { duration: 6000 },
        );
        return;
      }

      toast.success('Invoice extracted successfully.');
    },
    onError: (err: unknown) => {
      toast.dismiss('invoice-upload');

      if ((err as { code?: string })?.code === 'ERR_CANCELED') {
        toast('Upload cancelled.');
        return;
      }

      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail;
      toast.error(detail || 'Invoice upload failed. Please try again.');
    },
    onSettled: () => {
      setUploadProgress(0);
      clearInvoiceUploadAbort();
    },
  });

  const trackedMutations = useMutationState({
    filters: { mutationKey: INVOICE_UPLOAD_MUTATION_KEY },
  });
  const latestMutation = trackedMutations[trackedMutations.length - 1];

  const isPending =
    latestMutation?.status === 'pending' || mutation.isPending;

  const data =
    latestMutation?.status === 'success'
      ? (latestMutation.data as InvoiceUploadResponse | undefined)
      : mutation.data;

  const cancel = () => {
    cancelInvoiceUploadAbort();
    toast.dismiss('invoice-upload');
  };

  const reset = () => {
    mutation.reset();
  };

  return {
    upload: mutation.mutateAsync,
    cancel,
    isPending,
    uploadProgress,
    data,
    reset,
  };
};
