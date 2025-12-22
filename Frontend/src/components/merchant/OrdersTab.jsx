import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock, Loader2, CheckCircle2 } from 'lucide-react';
import OrderList from './OrderList';

const OrdersTab = ({ pendingOrders, activeOrders, onUpdateStatus }) => {
  const preparingOrders = activeOrders?.filter(o => o.status === 'preparing') || [];
  const readyOrders = activeOrders?.filter(o => o.status === 'ready') || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)] min-h-[600px]">

      {/* 1. PENDING COLUMN */}
      <div className="flex flex-col h-full bg-orange-50/50 rounded-xl border border-orange-100/50">
        <div className="p-4 border-b border-orange-100 bg-orange-50/80 rounded-t-xl sticky top-0 backdrop-blur-sm z-10 flex justify-between items-center">
          <h3 className="font-bold text-orange-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" /> Pending
          </h3>
          <span className="bg-orange-200 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
            {pendingOrders?.length || 0}
          </span>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <OrderList
            orders={pendingOrders}
            onUpdateStatus={onUpdateStatus}
            category="pending"
          />
        </div>
      </div>

      {/* 2. PREPARING COLUMN */}
      <div className="flex flex-col h-full bg-blue-50/50 rounded-xl border border-blue-100/50">
        <div className="p-4 border-b border-blue-100 bg-blue-50/80 rounded-t-xl sticky top-0 backdrop-blur-sm z-10 flex justify-between items-center">
          <h3 className="font-bold text-blue-900 flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin-slow" /> Preparing
          </h3>
          <span className="bg-blue-200 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
            {preparingOrders.length}
          </span>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <OrderList
            orders={preparingOrders}
            onUpdateStatus={onUpdateStatus}
            category="preparing"
          />
        </div>
      </div>

      {/* 3. READY COLUMN */}
      <div className="flex flex-col h-full bg-green-50/50 rounded-xl border border-green-100/50">
        <div className="p-4 border-b border-green-100 bg-green-50/80 rounded-t-xl sticky top-0 backdrop-blur-sm z-10 flex justify-between items-center">
          <h3 className="font-bold text-green-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" /> Ready
          </h3>
          <span className="bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
            {readyOrders.length}
          </span>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <OrderList
            orders={readyOrders}
            onUpdateStatus={onUpdateStatus}
            category="ready"
          />
        </div>
      </div>

    </div>
  );
};

export default OrdersTab;
