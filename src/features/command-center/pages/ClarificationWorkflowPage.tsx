import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Send, Mail, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ErrorState } from '../../../components/ui/ErrorState';
import {
  useGenerateClarificationDraft,
  useSendClarification,
} from '../hooks/useWorkflowActions';
import { useAuth } from '../../auth/hooks/useAuth';
import type { ClarificationDraftResponse } from '../types/workflow.types';

export const ClarificationWorkflowPage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const bucket = (location.state as { bucket?: string } | null)?.bucket;

  const { userId } = useAuth();
  const generateMutation = useGenerateClarificationDraft(invoiceId ?? '');
  const sendMutation = useSendClarification(invoiceId ?? '');

  const [draft, setDraft] = useState<ClarificationDraftResponse | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);

  const backHref = bucket
    ? `/command-center/invoice/${invoiceId}`
    : `/command-center/invoice/${invoiceId}`;

  const handleGenerate = async () => {
    const result = await generateMutation.mutateAsync();
    setDraft(result);
    setSubject(result.subject);
    setBody(result.body);
  };

  const handleSend = async () => {
    if (!userId || !subject || !body) return;
    await sendMutation.mutateAsync({ sent_by: userId, subject, body });
    setSent(true);
  };

  if (!invoiceId) {
    return <ErrorState kind="notFound" />;
  }

  if (sent) {
    return (
      <div>
        <PageHeader title="Clarification Sent" />
        <div className="max-w-lg mx-auto mt-8">
          <Card className="text-center">
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-success-muted)]">
                <Mail className="h-7 w-7 text-[var(--color-success)]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--color-foreground)]">
                  Clarification email sent
                </h3>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                  The vendor has been contacted. The invoice will remain under review until
                  a response is received.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(backHref, { state: { bucket } })}
              >
                Return to Invoice
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
          title="Request Clarification"
          description="Generate an AI-drafted clarification email and review it before sending to the vendor."
          className="mb-0"
        />
      </div>

      <div className="max-w-2xl space-y-5">
        {!draft ? (
          <Card>
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-info-muted)]">
                <Mail className="h-6 w-6 text-[var(--color-info)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-foreground)]">
                  Generate clarification draft
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)] max-w-sm">
                  The AI will analyze validation issues and draft an email to the vendor
                  requesting clarification.
                </p>
              </div>
              <Button
                onClick={handleGenerate}
                loading={generateMutation.isPending}
              >
                {generateMutation.isPending ? 'Generating…' : 'Generate Draft'}
              </Button>
              {generateMutation.isError && (
                <Button variant="ghost" size="sm" onClick={handleGenerate}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1" /> Retry
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <>
            {/* Clarification points */}
            {draft.clarification_points.length > 0 && (
              <Card>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-3">
                  Points requiring clarification
                </h3>
                <ul className="space-y-1.5">
                  {draft.clarification_points.map((pt, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[var(--color-foreground)]"
                    >
                      <span className="flex-shrink-0 h-4 w-4 rounded-full bg-[var(--color-warning-muted)] text-[var(--color-warning)] flex items-center justify-center text-[10px] font-bold mt-0.5">
                        {i + 1}
                      </span>
                      {pt}
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
                    size="sm"
                    onClick={handleSend}
                    loading={sendMutation.isPending}
                    disabled={!subject.trim() || !body.trim()}
                    leftIcon={<Send className="h-3.5 w-3.5" />}
                  >
                    Send Clarification
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};
