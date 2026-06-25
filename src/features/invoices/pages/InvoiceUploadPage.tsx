import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Info } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { FileDropzone } from '../../../components/ui/FileDropzone';
import { useInvoiceUpload } from '../hooks/useInvoiceUpload';
import toast from 'react-hot-toast';

export const InvoiceUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const { upload, isPending, uploadProgress, data, reset } = useInvoiceUpload();

  const handleUpload = async () => {
    if (!file) return;
    try {
      const result = await upload(file);
      if (result.document_type !== 'invoice') {
        toast.error(
          `Document classified as "${result.document_type}", not an invoice. Please upload an invoice document.`,
          { duration: 6000 },
        );
        reset();
        setFile(null);
        return;
      }
      toast.success('Invoice extracted successfully.');
    } catch {
      // error handled in hook
    }
  };

  if (data && data.document_type === 'invoice') {
    return (
      <div>
        <PageHeader title="Invoice Upload" />
        <div className="max-w-lg mx-auto mt-8">
          <Card className="text-center">
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-success-muted)]">
                <CheckCircle2 className="h-7 w-7 text-[var(--color-success)]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--color-foreground)]">
                  Extraction complete
                </h3>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)] max-w-xs mx-auto">
                  {data.message}
                </p>
                {data.extraction_status && (
                  <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                    Status: <span className="font-medium">{data.extraction_status.replace(/_/g, ' ')}</span>
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { reset(); setFile(null); }}
                >
                  Upload another
                </Button>
                {data.invoice_id &&
                  (data.extraction_status === 'human_review_needed' ||
                    data.extraction_status === 'low_confidence') ? (
                  <Button
                    size="sm"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    onClick={() => navigate(`/extraction-review/${data.invoice_id}`)}
                  >
                    Review extraction
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    onClick={() => navigate('/invoices/processing')}
                  >
                    View processing
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Invoice Upload"
        description="Upload an invoice PDF or image for automated extraction and validation."
      />

      <div className="max-w-xl mx-auto space-y-4">
        <Card>
          <div className="space-y-5">
            <FileDropzone
              onFile={setFile}
              disabled={isPending}
              accept={['.pdf', '.png', '.jpg', '.jpeg', '.tiff']}
            />

            {isPending && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[var(--color-muted-foreground)]">
                  <span>
                    {uploadProgress < 100 ? 'Uploading document…' : 'Extracting data with AI…'}
                  </span>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <span>{uploadProgress}%</span>
                  )}
                </div>
                <div className="h-1.5 w-full rounded-full bg-[var(--color-muted)] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      uploadProgress < 100
                        ? 'bg-[var(--color-primary)]'
                        : 'bg-[var(--color-success)] animate-pulse'
                    }`}
                    style={{ width: uploadProgress < 100 ? `${uploadProgress}%` : '100%' }}
                  />
                </div>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleUpload}
              disabled={!file}
              loading={isPending}
            >
              Extract Invoice
            </Button>
          </div>
        </Card>

        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-[var(--color-info-muted)] border border-sky-100">
          <Info className="h-4 w-4 text-[var(--color-info)] flex-shrink-0 mt-0.5" />
          <div className="text-xs text-[var(--color-info-muted-foreground)] space-y-1">
            <p className="font-medium">Extraction notice</p>
            <p>
              AI extraction takes 15–60 seconds depending on document complexity. Fields with
              low confidence will be flagged for your review before approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
