import React from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const OrderDetailModal = ({ order, onUpdateStatus }) => {
  if (!order) return null;

  const isMultiMeal = Array.isArray(order.meals);

  const getOrderStatusColor = (status) => {
    const statusMap = {
      pending: 'secondary',
      completed: 'success',
      canceled: 'destructive'
    };
    return statusMap[status] || 'secondary';
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Order #{order.id}</DialogTitle>
        <DialogDescription>
          Detailed view of the order placed by {order.customer_name || 'Customer'}.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Status:</span>
          <Badge variant={getOrderStatusColor(order.status)}>{order.status}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold">Order Date:</span>
          <span>{new Date(order.created_at || order.createdAt).toLocaleString()}</span>
        </div>

        <div className="border-t pt-4 mt-4">
          <h4 className="font-bold mb-2">Order Items</h4>
          {/* NOTE: In the future, you should fetch 'order_items' from the API.
             For now, we are displaying the summary based on the order table columns.
          */}
          <div className="p-3 border rounded-lg bg-gray-50/50">
            <div className="flex justify-between">
              <span className="font-medium">Total Meals:</span>
              <span>{order.meal_count}</span>
            </div>
            <div className="flex justify-between mt-1 text-sm text-gray-500">
              <span>Meal Cost:</span>
              <span>LKR {Number(order.meal_total || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mt-1 text-sm text-gray-500">
              <span>Platform Fee:</span>
              <span>LKR {Number(order.website_charge || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center font-bold text-lg border-t pt-4 mt-4">
          <span>Total:</span>
          {/* ✅ FIXED: Converted to Number() before toFixed() to prevent crash */}
          <span className="text-orange-600">LKR {Number(order.total || 0).toFixed(2)}</span>
        </div>
      </div>

      <DialogFooter>
        {order.status === 'pending' && (
          <Button
            onClick={() => onUpdateStatus(order.id, 'preparing')}
            className="bg-blue-500 hover:bg-blue-600 text-white w-full"
          >
            Accept Order
          </Button>
        )}
        {(order.status === 'preparing' || order.status === 'accepted') && (
          <Button
            onClick={() => onUpdateStatus(order.id, 'ready')}
            className="bg-green-500 hover:bg-green-600 text-white w-full"
          >
            Mark Ready for Pickup
          </Button>
        )}
        {order.status === 'ready' && (
          <Button
            onClick={() => onUpdateStatus(order.id, 'completed')}
            className="bg-gray-800 hover:bg-gray-900 text-white w-full"
          >
            Complete Order
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
};

export default OrderDetailModal;