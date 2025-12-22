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
import {
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  ShoppingBag,
  DollarSign,
  User,
  Calendar,
  Utensils
} from 'lucide-react';

const OrderDetailModal = ({ order, onUpdateStatus }) => {
  if (!order) return null;

  const isMultiMeal = Array.isArray(order.meals);

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
      case 'canceled':
        return 'destructive'; // Standard variant
      default:
        return 'secondary';
    }
  };

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 mr-1" />;
      case 'preparing': return <ChefHat className="w-4 h-4 mr-1" />;
      case 'ready': return <ShoppingBag className="w-4 h-4 mr-1" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 mr-1" />;
      case 'canceled': return <XCircle className="w-4 h-4 mr-1" />;
      default: return null;
    }
  };

  return (
    <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border border-gray-100 shadow-2xl">
      <DialogHeader className="border-b pb-4">
        <div className="flex justify-between items-start">
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Order #{order.id}
            </DialogTitle>
            <DialogDescription className="text-gray-500 mt-1 flex items-center gap-1">
              <User className="w-3 h-3" />
              {order.customer_name || 'Guest Customer'}
            </DialogDescription>
          </div>
          <Badge className={`${getOrderStatusColor(order.status)} px-3 py-1 flex items-center shadow-sm`}>
            <StatusIcon status={order.status} />
            <span className="capitalize font-semibold">{order.status}</span>
          </Badge>
        </div>
      </DialogHeader>

      <div className="py-4 space-y-6">
        {/* Order Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Order Date
            </span>
            <span className="text-sm font-semibold text-gray-700">
              {new Date(order.created_at || order.createdAt).toLocaleDateString()}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(order.created_at || order.createdAt).toLocaleTimeString()}
            </span>
          </div>

          <div className="flex flex-col space-y-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider flex items-center gap-1">
              <Utensils className="w-3 h-3" /> Total Meals
            </span>
            <span className="text-lg font-bold text-gray-900">
              {order.meal_count}
            </span>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-sm uppercase tracking-wide">
            <DollarSign className="w-4 h-4 text-orange-500" />
            Payment Summary
          </h4>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Meal Cost</span>
              <span className="font-medium text-gray-900">LKR {Number(order.meal_total || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Platform Fee</span>
              <span className="font-medium text-gray-900">LKR {Number(order.website_charge || 0).toFixed(2)}</span>
            </div>

            <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-center">
              <span className="font-bold text-gray-800">Total Amount</span>
              <span className="font-bold text-lg text-orange-600">
                LKR {Number(order.total || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="sm:justify-between gap-3 border-t pt-4">
        {order.status === 'pending' && (
          <Button
            onClick={() => onUpdateStatus(order.id, 'preparing')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95 text-base font-medium h-11"
          >
            <ChefHat className="w-4 h-4 mr-2" /> Start Preparing
          </Button>
        )}
        {(order.status === 'preparing' || order.status === 'accepted') && (
          <Button
            onClick={() => onUpdateStatus(order.id, 'ready')}
            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md transition-all active:scale-95 text-base font-medium h-11"
          >
            <ShoppingBag className="w-4 h-4 mr-2" /> Mark Ready for Pickup
          </Button>
        )}
        {order.status === 'ready' && (
          <Button
            onClick={() => onUpdateStatus(order.id, 'completed')}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white shadow-md transition-all active:scale-95 text-base font-medium h-11"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" /> Complete Order
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
};

export default OrderDetailModal;