import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Mail, RefreshCw, Loader2 } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { ErrorState } from '../../../components/ui/ErrorState';
import {
  useGenerateRejectionDraft,
  useSendRejection,
  useRejectInvoice,
} from '../hooks/useWorkflowActions';
import { useAuth } from '../../auth/hooks/useAuth';
import type { RejectionDraftResponse } from '../types/workflow.types';

export const RejectionWorkflowPage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const bucket = (location.state as { bucket?: string } | null)?.bucket;

  const { userId } = useAuth();
  const generateMutation = useGenerateRejectionDraft(invoiceId ?? '');
  const sendMutation = useSendRejection(invoiceId ?? '');
  const rejectMutation = useRejectInvoice(invoiceId ?? '');

  const [draft, setDraft] = useState<RejectionDraftResponse | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [done, setDone] = useState(false);

  const backHref = `/command-center/invoice/${invoiceId}`;

  const handleGenerate = async () => {
    const result = await generateMutation.mutateAsync();
    setDraft(result);
    setSubject(result.subject);
    setBody(result.body);
    setRejectionReason(result.issues.join('; '));
  };

  const handleRejectAndSend = async () => {
    if (!userId || !subject || !body || !rejectionReason) return;
    setConfirmRejectOpen(false);
    await rejectMutation.mutateAsync({
      rejected_by: userId,
      rejection_reason: rejectionReason,
    });
    await sendMutation.mutateAsync({ sent_by: userId, subject, body });
    setDone(true);
  };

  if (!invoiceId) {
    return <ErrorState kind="notFound" />;
  }

  if (done) {
    return (
      <div>
        <PageHeader title="Invoice Rejected" />
        <div className="max-w-lg mx-auto mt-8">
          <Card className="text-center">
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-destructive-muted)]">
                <Mail className="h-7 w-7 text-[var(--color-destructive)]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--color-foreground)]">
                  Invoice rejected & vendor notified
                </h3>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                  The rejection email has been sent to the vendor. This invoice has been
                  moved to the Rejected bucket.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/command-center/rejected')}
              >
                View Rejected Invoices
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <button
          onClick={() => navigate(backHref, { state: { bucket } })}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Invoice Review
        </button>
        <PageHeader
          title="Reject Invoice"
          description="Generate a rejection email draft and notify the vendor after confirmation."
          className="mb-0"
        />
      </div>

      <div className="max-w-2xl space-y-5">
        {!draft ? (
          <Card>
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-destructive-muted)]">
                <Mail className="h-6 w-6 text-[var(--color-destructive)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-foreground)]">
                  Generate rejection draft
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)] max-w-sm">
                  The AI will compile the validation issues and draft a professional rejection
                  email to the vendor.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleGenerate}
                loading={generateMutation.isPending}
              >
                {generateMutation.isPending ? 'Generating…' : 'Generate Rejection Draft'}
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Issues summary */}
            {draft.issues.length > 0 && (
              <Card>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-3">
                  Rejection reasons
                </h3>
                <ul className="space-y-1.5">
                  {draft.issues.map((issue, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[var(--color-foreground)]"
                    >
                      <span className="flex-shrink-0 h-4 w-4 rounded-full bg-[var(--color-destructive-muted)] text-[var(--color-destructive)] flex items-center justify-center text-[10px] font-bold mt-0.5">
                        !
                      </span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Email editor */}
            <Card>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
                    To
                  </label>
                  <div className="flex h-9 items-center rounded border border-[var(--color-border)] bg-[var(--color-muted)] px-3 text-sm text-[var(--color-muted-foreground)]">
                    {draft.vendor_email ?? 'Vendor email not available'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="flex h-9 w-full rounded border border-[var(--color-border)] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
                    Body
                  </label>
                  <textarea
                    rows={12}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="flex w-full resize-none rounded border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]">
                    Rejection reason <span className="font-normal">(for internal record)</span>
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="flex h-9 w-full rounded border border-[var(--color-border)] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending || sendMutation.isPending}
                    leftIcon={
                      generateMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )
                    }
                  >
                    Regenerate draft
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setConfirmRejectOpen(true)}
                    loading={rejectMutation.isPending || sendMutation.isPending}
                    disabled={!subject.trim() || !body.trim() || !rejectionReason.trim()}
                    leftIcon={<Send className="h-3.5 w-3.5" />}
                  >
                    Reject & Notify Vendor
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmRejectOpen}
        onClose={() => setConfirmRejectOpen(false)}
        onConfirm={handleRejectAndSend}
        loading={rejectMutation.isPending || sendMutation.isPending}
        title="Reject this invoice?"
        description="This will reject the invoice and send the notification email to the vendor. This action cannot be undone."
        confirmLabel="Reject & Send"
        destructive
      />
    </div>
  );
};
