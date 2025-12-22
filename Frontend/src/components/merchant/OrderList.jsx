import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import OrderDetailModal from './OrderDetailModal';
import { ChevronRight, Clock, Utensils } from 'lucide-react';

const OrderList = ({ orders, onUpdateStatus, category }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400 opacity-60">
        <Utensils className="w-10 h-10 mb-2" />
        <p className="text-sm font-medium">No orders</p>
      </div>
    );
  }

  // Styles based on category
  const cardStyles = {
    pending: "border-l-4 border-l-orange-500 hover:shadow-orange-100",
    preparing: "border-l-4 border-l-blue-500 hover:shadow-blue-100",
    ready: "border-l-4 border-l-green-500 hover:shadow-green-100 bg-green-50/30",
  };

  return (
    <>
      <Dialog>
        {orders.map(order => {
          const total = Number(order.total) || 0;
          const itemCount = order.meal_count || 0;
          const time = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <DialogTrigger key={order.id} asChild>
              <div
                className={`group bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${cardStyles[category] || ""}`}
                onClick={() => setSelectedOrder(order)}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3 pb-3 border-b border-dashed border-gray-200">
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">#{order.id}</h4>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {time}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">RS {total.toFixed(0)}</p>
                    <p className="text-xs text-gray-500">{itemCount} items</p>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {order.customer_name || 'Guest'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Tap to view details...
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-2">
                  {category === 'pending' && (
                    <Button
                      size="sm"
                      className="w-full bg-orange-100 text-orange-700 hover:bg-orange-200 border-none font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(order.id, 'preparing');
                      }}
                    >
                      Accept & Cook
                    </Button>
                  )}
                  {category === 'preparing' && (
                    <Button
                      size="sm"
                      className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200 border-none font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(order.id, 'ready');
                      }}
                    >
                      Mark Ready
                    </Button>
                  )}
                  {category === 'ready' && (
                    <Button
                      size="sm"
                      className="w-full bg-green-100 text-green-700 hover:bg-green-200 border-none font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(order.id, 'completed');
                      }}
                    >
                      Complete Order
                    </Button>
                  )}
                </div>
              </div>
            </DialogTrigger>
          );
        })}

        <DialogContent className="max-w-2xl">
          {selectedOrder && (
            <OrderDetailModal order={selectedOrder} onUpdateStatus={onUpdateStatus} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderList;
