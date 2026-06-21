import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { purchaseOrderService } from '../services/purchaseOrderService';
import type { PurchaseOrderListItem } from '../types/purchaseOrder.types';

export const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fetchPurchaseOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await purchaseOrderService.listPurchaseOrders();
      setPurchaseOrders(data.items);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load purchase orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  const uploadPurchaseOrder = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await purchaseOrderService.uploadPurchaseOrder(file);
      toast.success(`PO ${result.po_number} uploaded successfully`);
      await fetchPurchaseOrders();
      return result;
    } catch {
      toast.error('Failed to upload purchase order');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    purchaseOrders,
    total,
    isLoading,
    isUploading,
    fetchPurchaseOrders,
    uploadPurchaseOrder,
  };
};
