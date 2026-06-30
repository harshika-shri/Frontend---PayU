export interface MonitoringStatusResponse {
  email_address: string;
  is_monitoring: boolean;
  last_processed_history_id: number | null;
}

export type MailStatus =
  | 'invoice_created'
  | 'attachment_processed'
  | 'no_attachment';

export interface RecentMailItem {
  message_id: string;
  mailbox: string | null;
  subject: string | null;
  received_from: string | null;
  attachment_filename: string | null;
  processed_at: string;
  has_invoice: boolean;
  mail_status: MailStatus;
  invoice_id: string | null;
}

export interface RecentMailListResponse {
  items: RecentMailItem[];
  total: number;
}
