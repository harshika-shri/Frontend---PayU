import React, { useState } from 'react';
import { Paperclip } from 'lucide-react';
import type { MailStatus, RecentMailItem } from '../types/mailMonitoring.types';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { MailAttachmentPreviewModal } from './MailAttachmentPreviewModal';

interface RecentMailTableProps {
  items: RecentMailItem[];
  isLoading?: boolean;
}

const formatDate = (value: string | null) => {
  if (!value) return '—';
  return new Date(value).toLocaleString();
};

const truncate = (value: string | null, max = 72) => {
  if (!value) return '—';
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
};

const mailStatusLabel: Record<MailStatus, string> = {
  invoice_created: 'Invoice created',
  attachment_processed: 'Attachment processed',
  no_attachment: 'No attachment',
};

const mailStatusVariant = (
  status: MailStatus,
): 'success' | 'info' | 'secondary' => {
  if (status === 'invoice_created') return 'success';
  if (status === 'attachment_processed') return 'info';
  return 'secondary';
};

export const RecentMailTable: React.FC<RecentMailTableProps> = ({
  items,
  isLoading = false,
}) => {
  const [previewItem, setPreviewItem] = useState<RecentMailItem | null>(null);

  if (isLoading) {
    return (
      <Card>
        <div className="py-10 flex justify-center text-[var(--color-muted-foreground)] text-sm">
          Loading recent mail...
        </div>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card noPadding>
        <EmptyState
          title="No mail processed yet"
          description="Processed emails will appear here after Gmail monitoring receives and handles them."
        />
      </Card>
    );
  }

  return (
    <>
      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-muted)] border-b border-[var(--color-border)]">
                <th className="px-6 py-3.5 text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                  Attachment
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                  Processed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {items.map((item) => (
                <tr
                  key={`${item.message_id}-${item.invoice_id ?? item.attachment_filename ?? 'none'}`}
                  className="hover:bg-[var(--color-muted)]/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[var(--color-foreground)]">
                      {truncate(item.subject, 56) || '(No subject)'}
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-muted-foreground)] font-mono">
                      {item.message_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-foreground)]">
                    {item.received_from || '—'}
                  </td>
                  <td className="px-6 py-4">
                    {item.attachment_filename ? (
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:underline text-left"
                        title="View attachment"
                      >
                        <Paperclip className="h-3.5 w-3.5 flex-shrink-0" />
                        {truncate(item.attachment_filename, 40)}
                      </button>
                    ) : (
                      <span className="text-sm text-[var(--color-muted-foreground)]">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={mailStatusVariant(item.mail_status)}>
                      {mailStatusLabel[item.mail_status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-muted-foreground)]">
                    {formatDate(item.processed_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <MailAttachmentPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />
    </>
  );
};
