import { useQuery } from '@tanstack/react-query';
import { purchaseOrderService } from '../services/purchaseOrderService';
import type { PurchaseOrderDetailResponse } from '../types/purchaseOrder.types';

export const purchaseOrderDetailKey = (poId: string) =>
  ['purchase-order', poId] as const;

export const usePurchaseOrderDetail = (poId: string) =>
  useQuery<PurchaseOrderDetailResponse>({
    queryKey: purchaseOrderDetailKey(poId),
    queryFn: () => purchaseOrderService.getPurchaseOrder(poId),
    enabled: Boolean(poId),
  });
