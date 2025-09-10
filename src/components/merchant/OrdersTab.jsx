import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock, ShoppingBag } from 'lucide-react';
import OrderList from './OrderList';

const OrdersTab = ({ pendingOrders, activeOrders, onUpdateStatus }) => {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="store-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-orange-500" />
            Pending Orders ({pendingOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-h-96 overflow-y-auto">
          <OrderList orders={pendingOrders} onUpdateStatus={onUpdateStatus} category="pending" />
        </CardContent>
      </Card>

      <Card className="store-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2 text-blue-500" />
            Active Orders ({activeOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-h-96 overflow-y-auto">
          <OrderList orders={activeOrders} onUpdateStatus={onUpdateStatus} category="active" />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersTab;