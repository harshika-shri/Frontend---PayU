import React from 'react';
import { Badge } from './Badge';

type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info' | 'outline';

interface StatusConfig {
  label: string;
  variant: BadgeVariant;
}

const extractionStatusMap: Record<string, StatusConfig> = {
  pending: { label: 'Pending', variant: 'secondary' },
  ocr_processing: { label: 'Processing', variant: 'info' },
  extracted: { label: 'Extracted', variant: 'default' },
  low_confidence: { label: 'Low Confidence', variant: 'warning' },
  human_review_needed: { label: 'Review Needed', variant: 'warning' },
  extraction_approved: { label: 'Approved', variant: 'success' },
};

const invoiceStatusMap: Record<string, StatusConfig> = {
  under_validation: { label: 'Under Validation', variant: 'info' },
  match_approved: { label: 'Match Approved', variant: 'success' },
  match_issues: { label: 'Match Issues', variant: 'warning' },
  approved_ready_to_pay: { label: 'Ready to Pay', variant: 'success' },
  pending_action: { label: 'Pending Action', variant: 'warning' },
  overdue: { label: 'Overdue', variant: 'destructive' },
  paid: { label: 'Paid', variant: 'success' },
  under_review: { label: 'Under Review', variant: 'info' },
  ready_for_approval: { label: 'Ready for Approval', variant: 'default' },
  partially_approved: { label: 'Partially Approved', variant: 'warning' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  escalated: { label: 'Escalated', variant: 'destructive' },
  ready_to_pay: { label: 'Ready to Pay', variant: 'success' },
};

const poStatusMap: Record<string, StatusConfig> = {
  open: { label: 'Open', variant: 'info' },
  partially_processed: { label: 'Partial', variant: 'warning' },
  closed: { label: 'Closed', variant: 'secondary' },
};

interface StatusBadgeProps {
  status: string;
  type?: 'extraction' | 'invoice' | 'po' | 'generic';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'generic' }) => {
  const statusMap =
    type === 'extraction'
      ? extractionStatusMap
      : type === 'invoice'
      ? invoiceStatusMap
      : type === 'po'
      ? poStatusMap
      : {};

  const config = statusMap[status?.toLowerCase()] ?? {
    label: status?.replace(/_/g, ' ') ?? '—',
    variant: 'secondary' as BadgeVariant,
  };

  return <Badge variant={config.variant} dot>{config.label}</Badge>;
};
