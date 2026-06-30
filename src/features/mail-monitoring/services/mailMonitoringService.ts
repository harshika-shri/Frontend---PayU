import Cookies from 'js-cookie';
import { env } from '../../../config/env';
import { docExtractionClient } from '../../../lib/docExtractionClient';
import { commandCenterClient } from '../../../lib/commandCenterClient';
import type {
  MonitoringStatusResponse,
  RecentMailListResponse,
  RecentMailItem,
} from '../types/mailMonitoring.types';

export const mailMonitoringService = {
  getStatus: async (emailAddress: string): Promise<MonitoringStatusResponse> => {
    const response = await docExtractionClient.get<MonitoringStatusResponse>(
      '/gmail-monitoring/status',
      { params: { email_address: emailAddress } },
    );
    return response.data;
  },

  startMonitoring: async (emailAddress: string): Promise<{ message: string }> => {
    const response = await docExtractionClient.post<{ message: string }>(
      '/gmail-monitoring/start',
      { email_address: emailAddress },
    );
    return response.data;
  },

  stopMonitoring: async (emailAddress: string): Promise<{ message: string }> => {
    const response = await docExtractionClient.post<{ message: string }>(
      '/gmail-monitoring/stop',
      { email_address: emailAddress },
    );
    return response.data;
  },

  listRecentMail: async (mailbox?: string): Promise<RecentMailListResponse> => {
    const response = await commandCenterClient.get<RecentMailListResponse>(
      '/mail-monitoring/recent-mails',
      {
        params: mailbox ? { mailbox } : undefined,
      },
    );
    return response.data;
  },

  fetchAttachmentPreview: async (
    item: Pick<RecentMailItem, 'message_id' | 'invoice_id' | 'attachment_filename'>,
  ): Promise<{ blobUrl: string; fileType: 'pdf' | 'image' | null }> => {
    const token = Cookies.get('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const url = item.invoice_id
      ? `${env.docExtractionUrl}/invoices/${item.invoice_id}/document`
      : `${env.docExtractionUrl}/gmail-monitoring/messages/${encodeURIComponent(item.message_id)}/attachment`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error('Attachment could not be loaded.');
    }

    const contentType = response.headers.get('content-type') ?? '';
    const filename = item.attachment_filename ?? '';
    let fileType: 'pdf' | 'image' | null = null;

    if (contentType.includes('pdf') || filename.toLowerCase().endsWith('.pdf')) {
      fileType = 'pdf';
    } else if (
      contentType.startsWith('image/')
      || /\.(png|jpe?g|tiff?)$/i.test(filename)
    ) {
      fileType = 'image';
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    return { blobUrl, fileType };
  },
};
