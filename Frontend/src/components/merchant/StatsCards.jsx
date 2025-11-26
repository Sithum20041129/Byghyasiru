import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, ShoppingBag, CheckCircle, CalendarCheck } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const StatCard = ({ title, value, icon: Icon, colorClass, iconColorClass }) => (
  <Card className="store-card">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${colorClass}`}>
            {Number(value || 0).toFixed(0)} {/* ✅ convert safely */}
          </p>
        </div>
        <Icon className={`w-8 h-8 ${iconColorClass}`} />
      </div>
    </CardContent>
  </Card>
);

const StatsCards = ({ pendingCount, activeCount, completedTodayCount, completedMonthCount, storeSettings, onToggleSetting }) => {
  const stats = [
    { title: 'Pending Orders', value: pendingCount, icon: Clock, color: 'text-orange-600', iconColor: 'text-orange-500' },
    { title: 'Ready for Pickup', value: activeCount, icon: ShoppingBag, color: 'text-blue-600', iconColor: 'text-blue-500' },
    { title: 'Completed Today', value: completedTodayCount, icon: CheckCircle, color: 'text-green-600', iconColor: 'text-green-500' },
    { title: 'Completed This Month', value: completedMonthCount, icon: CalendarCheck, color: 'text-purple-600', iconColor: 'text-purple-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="mb-8"
    >
      {/* Store Status Toggles */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Store Status</h2>
          <p className="text-gray-500 text-sm">Manage your store's availability instantly</p>
        </div>
        <div className="flex gap-8">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <Label htmlFor="store-open" className="font-semibold block">Store Open</Label>
              <span className="text-xs text-gray-500">{storeSettings?.is_open ? "Online" : "Offline"}</span>
            </div>
            <Switch
              id="store-open"
              checked={storeSettings?.is_open}
              onCheckedChange={(val) => onToggleSetting('is_open', val)}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <Label htmlFor="accepting-orders" className="font-semibold block">Accepting Orders</Label>
              <span className="text-xs text-gray-500">{storeSettings?.accepting_orders ? "Yes" : "No"}</span>
            </div>
            <Switch
              id="accepting-orders"
              checked={storeSettings?.accepting_orders}
              onCheckedChange={(val) => onToggleSetting('accepting_orders', val)}
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            colorClass={stat.color}
            iconColorClass={stat.iconColor}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default StatsCards;
