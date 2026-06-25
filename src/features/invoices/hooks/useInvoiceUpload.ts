import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { invoiceService } from '../services/invoiceService';
import type { InvoiceUploadResponse } from '../types/invoice.types';

export const useInvoiceUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation<InvoiceUploadResponse, unknown, File>({
    mutationFn: (file: File) => invoiceService.uploadInvoice(file, setUploadProgress),
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || 'Invoice upload failed. Please try again.');
    },
    onSettled: () => setUploadProgress(0),
  });

  return {
    upload: mutation.mutateAsync,
    isPending: mutation.isPending,
    uploadProgress,
    data: mutation.data,
    reset: mutation.reset,
  };
};
