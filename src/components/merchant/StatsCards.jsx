import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, ShoppingBag, CheckCircle, CalendarCheck } from 'lucide-react';

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
      className="grid md:grid-cols-4 gap-6 mb-8"
    >
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
    </motion.div>
  );
};

export default StatsCards;
