import { useMutation } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { invoiceService } from '../services/invoiceService';
import type { InvoiceUploadResponse } from '../types/invoice.types';

export const useInvoiceUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<InvoiceUploadResponse, unknown, File>({
    mutationFn: (file: File) => {
      abortControllerRef.current = new AbortController();
      return invoiceService.uploadInvoice(
        file,
        setUploadProgress,
        abortControllerRef.current.signal,
      );
    },
    onError: (err: unknown) => {
      if ((err as { code?: string })?.code === 'ERR_CANCELED') {
        toast('Upload cancelled.');
        return;
      }
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || 'Invoice upload failed. Please try again.');
    },
    onSettled: () => {
      setUploadProgress(0);
      abortControllerRef.current = null;
    },
  });

  const cancel = () => {
    abortControllerRef.current?.abort();
  };

  return {
    upload: mutation.mutateAsync,
    cancel,
    isPending: mutation.isPending,
    uploadProgress,
    data: mutation.data,
    reset: mutation.reset,
  };
};
