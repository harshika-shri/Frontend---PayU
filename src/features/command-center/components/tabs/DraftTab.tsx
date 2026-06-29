import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Sparkles,
  Send,
  Mail,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { useSendClarification } from '../../hooks/useWorkflowActions';
import { useAuth } from '../../../auth/hooks/useAuth';
import {
  hasIssuesRequiringDraft,
  isEligibleForClarification,
} from '../../utils/validationIssueUtils';
import { buildClarificationDraft } from '../../utils/clarificationDraftBuilder';
import type { InvoiceValidationResponse } from '../../types/invoiceReview.types';

interface DraftTabProps {
  invoiceId: string;
  invoiceNumber?: string | null;
  vendorEmail?: string | null;
  validation: InvoiceValidationResponse;
  invoiceStatus?: string | null;
  onSent?: () => void;
}

export const DraftTab: React.FC<DraftTabProps> = ({
  invoiceId,
  invoiceNumber,
  vendorEmail,
  validation,
  invoiceStatus,
  onSent,
}) => {
  const { userId } = useAuth();
  const sendMutation = useSendClarification(invoiceId);

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);

  const clarificationAlreadySent = validation.clarification_sent;
  const draftLocked = sent || clarificationAlreadySent;
  const needsDraft = hasIssuesRequiringDraft(validation);
  const canClarify = isEligibleForClarification(invoiceStatus);

  const draft = useMemo(
    () => buildClarificationDraft(invoiceId, invoiceNumber, validation, vendorEmail),
    [invoiceId, invoiceNumber, validation, vendorEmail],
  );

  useEffect(() => {
    if (!draft) return;
    setSubject(draft.subject);
    setBody(draft.body);
  }, [draft]);

  const handleSend = async () => {
    if (!userId) return;
    await sendMutation.mutateAsync(
      { sent_by: userId, subject, body },
      {
        onSuccess: () => {
          setSent(true);
          onSent?.();
        },
      },
    );
  };

  if (!needsDraft && !draftLocked) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Mail className="h-8 w-8 text-[var(--color-muted-foreground)]" />
        <div>
          <p className="text-sm font-medium text-[var(--color-foreground)]">
            No clarification draft required
          </p>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
            This invoice does not need a vendor clarification email.
          </p>
        </div>
      </div>
    );
  }

  if (draftLocked) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50/60 px-4 py-4 flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 flex-shrink-0">
          <Mail className="h-4 w-4 text-green-700" />
        </div>
        <div>
          <p className="text-sm font-semibold text-green-900">Clarification email already sent</p>
          <p className="text-xs text-green-700 mt-0.5">
            The vendor has been notified. A new clarification email cannot be sent for this
            invoice.
          </p>
        </div>
      </div>
    );
  }

  if (!canClarify) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
        <AlertTriangle className="h-8 w-8 text-amber-600" />
        <div>
          <p className="text-sm font-medium text-[var(--color-foreground)]">
            Clarification not available for this invoice state
          </p>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
            This invoice cannot receive a clarification email in its current workflow state.
          </p>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Mail className="h-8 w-8 text-[var(--color-muted-foreground)]" />
        <p className="text-sm text-[var(--color-muted-foreground)]">
          No clarification points available for this invoice.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-[var(--color-muted)]/40 border-b border-[var(--color-border)]">
        <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-foreground)]">
          AI-Generated Clarification Draft
        </h3>
      </div>

      <div className="bg-white">
        <div className="border-b border-[var(--color-border)] divide-y divide-[var(--color-border)]">
          <div className="flex items-center gap-3 px-4 py-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] w-12 flex-shrink-0">
              To
            </span>
            {draft.vendor_email ? (
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary-muted)] flex-shrink-0">
                  <Mail className="h-3 w-3 text-[var(--color-primary)]" />
                </div>
                <span className="text-sm font-medium text-[var(--color-foreground)]">
                  {draft.vendor_email}
                </span>
                <Badge variant="default">Vendor</Badge>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-1">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="text-xs">No vendor email available — email cannot be sent</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 px-4 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] w-12 flex-shrink-0">
              Subject
            </span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 text-sm text-[var(--color-foreground)] bg-transparent focus:outline-none placeholder-[var(--color-muted-foreground)]"
              placeholder="Email subject"
            />
          </div>
        </div>

        {draft.clarification_points.length > 0 && (
          <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-muted)]/30">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-2">
              Key Points
            </p>
            <ul className="space-y-1.5">
              {draft.clarification_points.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-foreground)]">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="px-4 pt-3 pb-0">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            className="w-full text-sm text-[var(--color-foreground)] bg-transparent focus:outline-none resize-y font-mono leading-relaxed placeholder-[var(--color-muted-foreground)]"
            placeholder="Email body"
          />
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-muted)]/20">
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {draft.vendor_email
              ? `Will be sent to ${draft.vendor_email}`
              : 'No recipient configured'}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            loading={sendMutation.isPending}
            disabled={!subject.trim() || !body.trim() || !draft.vendor_email}
            leftIcon={<Send className="h-3.5 w-3.5" />}
          >
            Send to Vendor
          </Button>
        </div>
      </div>
    </div>
  );
};
