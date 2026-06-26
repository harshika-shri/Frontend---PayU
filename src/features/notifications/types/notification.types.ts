export interface NotificationItem {
  id: string;
  invoice_id: string | null;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  total_records: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  page: number;
}

export interface NotificationUnreadCountResponse {
  count: number;
}
