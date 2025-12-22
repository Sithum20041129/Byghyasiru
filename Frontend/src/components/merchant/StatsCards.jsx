import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, ShoppingBag, CheckCircle, CalendarCheck, Coffee, Sun, Moon } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const StatsCards = ({ pendingCount, activeCount, completedTodayCount, completedMonthCount }) => {
  const stats = [
    { title: 'Pending Orders', value: pendingCount, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', iconColor: 'text-orange-500' },
    { title: 'In Progress', value: activeCount, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', iconColor: 'text-blue-500' },
    { title: 'Served Today', value: completedTodayCount, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', iconColor: 'text-green-500' },
    { title: 'Month Total', value: completedMonthCount, icon: CalendarCheck, color: 'text-purple-600', bg: 'bg-purple-50', iconColor: 'text-purple-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {stats.map((stat, index) => (
        <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{stat.title}</p>
              <p className={`text-3xl font-extrabold ${stat.color}`}>
                {Number(stat.value || 0).toFixed(0)}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
};

export default StatsCards;
