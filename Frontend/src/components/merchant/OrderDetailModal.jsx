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
        <DialogTitle>Order #{order.orderNumber}</DialogTitle>
        <DialogDescription>
          Detailed view of the order placed by {order.customerName}.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Status:</span>
          <Badge variant={getOrderStatusColor(order.status)}>{order.status}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold">Order Date:</span>
          <span>{new Date(order.createdAt).toLocaleString()}</span>
        </div>

        <div className="border-t pt-4 mt-4">
          <h4 className="font-bold mb-2">Order Items</h4>
          {isMultiMeal ? (
            order.meals.map((meal, index) => (
              <div key={index} className="mb-4 p-3 border rounded-lg bg-gray-50/50">
                <h5 className="font-semibold">Meal #{index + 1}: {meal.mealType}</h5>
                {meal.curries && meal.curries.length > 0 && (
                  <div className="mt-1">
                    <p className="text-sm font-medium">Curries:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {meal.curries.map((curry, i) => <li key={i}>{curry}</li>)}
                    </ul>
                  </div>
                )}
                {meal.extras && meal.extras.length > 0 && (
                  <div className="mt-1">
                    <p className="text-sm font-medium">Extras:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {meal.extras.map((extra, i) => <li key={i}>{extra.item} x{extra.quantity}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-3 border rounded-lg bg-gray-50/50">
              <h5 className="font-semibold">{order.mealType}</h5>
              {order.curries && order.curries.length > 0 && (
                <div className="mt-1">
                  <p className="text-sm font-medium">Curries:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {order.curries.map((curry, i) => <li key={i}>{curry}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center font-bold text-lg border-t pt-4 mt-4">
          <span>Total:</span>
          <span className="text-orange-600">${order.total.toFixed(2)}</span>
        </div>
      </div>
      <DialogFooter>
        {order.status === 'pending' && (
          <Button
            onClick={() => onUpdateStatus(order.id, 'ready')}
            className="bg-blue-500 hover:bg-blue-600 text-white w-full"
          >
            Mark as Prepared
          </Button>
        )}
        {(order.status === 'ready' || order.status === 'preparing') && (
          <Button
            onClick={() => onUpdateStatus(order.id, 'completed')}
            className="bg-green-500 hover:bg-green-600 text-white w-full"
          >
            Mark as Completed
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
};

export default OrderDetailModal;