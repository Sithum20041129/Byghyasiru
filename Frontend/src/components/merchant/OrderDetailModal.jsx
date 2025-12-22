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
import { Separator } from '@/components/ui/separator';
import { Utensils, CheckCircle2, Clock } from 'lucide-react';

const OrderDetailModal = ({ order, onUpdateStatus }) => {
  if (!order) return null;

  // Separate items for better display
  const items = order.items || [];
  const mainMeals = items.filter(i => i.food_type === 'main_meal');
  const otherItems = items.filter(i => i.food_type !== 'main_meal');

  const getOrderStatusColor = (status) => {
    const statusMap = {
      pending: 'secondary',
      preparing: 'default', // Blueish usually
      ready: 'default',
      completed: 'success',
      cancelled: 'destructive'
    };
    return statusMap[status] || 'secondary';
  };

  return (
    <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
      <DialogHeader>
        <div className="flex justify-between items-start pr-4">
          <div>
            <DialogTitle className="text-xl font-bold">Order #{order.id}</DialogTitle>
            <DialogDescription className="mt-1">
              {order.customer_name || 'Guest Customer'}
            </DialogDescription>
          </div>
          <Badge variant={getOrderStatusColor(order.status)} className="capitalize px-3 py-1 text-sm">
            {order.status}
          </Badge>
        </div>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6">

        {/* Order Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div>
            {items.reduce((acc, i) => acc + i.quantity, 0)} Items
          </div>
        </div>

        {/* --- MAIN MEALS --- */}
        {mainMeals.length > 0 && (
          <div>
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-orange-600" /> Main Meals
            </h4>
            <div className="space-y-3">
              {mainMeals.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start p-3 bg-white border border-orange-100 rounded-xl shadow-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-gray-800">{item.quantity}x</span>
                      <span className="font-semibold text-gray-900">{item.food_name}</span>
                    </div>
                    {item.portion && (
                      <Badge variant="outline" className="mt-1 text-xs text-orange-600 border-orange-200 bg-orange-50">
                        Size: {item.portion}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-gray-900">LKR {Number(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- SIDES / CURRIES / EXTRAS --- */}
        {otherItems.length > 0 && (
          <div>
            <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider text-gray-500 mt-2">
              Sides & Curries
            </h4>
            <div className="space-y-2">
              {otherItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-500 w-6 text-right">{item.quantity}x</span>
                    <span className="text-gray-700">{item.food_name}</span>
                  </div>
                  {Number(item.price) > 0 ? (
                    <span className="text-sm font-medium text-gray-600">LKR {Number(item.price * item.quantity).toFixed(0)}</span>
                  ) : (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">FREE</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* --- TOTAL --- */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-bold text-gray-600">Total Amount</span>
          <span className="text-2xl font-black text-orange-600">LKR {Number(order.total).toFixed(0)}</span>
        </div>
      </div>

      <DialogFooter className="mt-4 pt-4 border-t border-gray-100">
        {order.status === 'pending' && (
          <Button
            onClick={() => onUpdateStatus(order.id, 'preparing')}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full h-11 text-lg shadow-lg shadow-blue-100"
          >
            Accept & Start Cooking
          </Button>
        )}
        {(order.status === 'preparing' || order.status === 'accepted') && (
          <Button
            onClick={() => onUpdateStatus(order.id, 'ready')}
            className="bg-green-600 hover:bg-green-700 text-white w-full h-11 text-lg shadow-lg shadow-green-100"
          >
            Mark Ready for Pickup
          </Button>
        )}
        {order.status === 'ready' && (
          <Button
            onClick={() => onUpdateStatus(order.id, 'completed')}
            className="bg-gray-800 hover:bg-gray-900 text-white w-full h-11 text-lg"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" /> Complete Order
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
};

export default OrderDetailModal;