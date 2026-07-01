const invoiceUploadAbort = { current: null as AbortController | null };
const poUploadAbort = { current: null as AbortController | null };

export const beginInvoiceUploadAbort = (): AbortSignal => {
  invoiceUploadAbort.current?.abort();
  invoiceUploadAbort.current = new AbortController();
  return invoiceUploadAbort.current.signal;
};

export const cancelInvoiceUploadAbort = (): void => {
  invoiceUploadAbort.current?.abort();
};

export const clearInvoiceUploadAbort = (): void => {
  invoiceUploadAbort.current = null;
};

export const beginPoUploadAbort = (): AbortSignal => {
  poUploadAbort.current?.abort();
  poUploadAbort.current = new AbortController();
  return poUploadAbort.current.signal;
};

export const cancelPoUploadAbort = (): void => {
  poUploadAbort.current?.abort();
};

export const clearPoUploadAbort = (): void => {
  poUploadAbort.current = null;
};
