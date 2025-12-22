import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import OrderDetailModal from './OrderDetailModal';

const OrderList = ({ orders, onUpdateStatus, category }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getOrderStatusColor = (status) => {
    const statusMap = {
      pending: 'secondary',
      completed: 'success',
      canceled: 'destructive'
    };
    return statusMap[status] || 'secondary';
  };

  if (!orders || orders.length === 0) {
    return <p className="text-gray-500 text-center py-8">No orders in this category</p>;
  }

  return (
    <>
      <Dialog>
        {orders.map(order => {
          // ✅ Ensure total is always a number
          const total = Number(order.total) || 0;

          return (
            <DialogTrigger key={order.id} asChild>
              <div
                className="border rounded-lg p-4 bg-white/50 cursor-pointer hover:bg-orange-50/50 transition-colors"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">Order #{order.orderNumber || order.id}</h4>
                  <Badge variant={getOrderStatusColor(order.status)}>
                    {order.status === 'completed' && category === 'active'
                      ? 'Completed'
                      : order.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Customer:</strong> {order.customerName || order.customer_name || 'Unknown'}
                </p>
                <div className="flex justify-between items-end">
                  <p className="text-sm text-gray-600 mb-0">
                    <strong>Total:</strong> ${total.toFixed(2)}
                  </p>
                  {order.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(order.id, 'ready');
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Mark as Prepared
                    </Button>
                  )}
                  {(order.status === 'ready' || order.status === 'preparing') && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(order.id, 'completed');
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            </DialogTrigger>
          );
        })}
        {selectedOrder && (
          <OrderDetailModal order={selectedOrder} onUpdateStatus={onUpdateStatus} />
        )}
      </Dialog>
    </>
  );
};

export default OrderList;
