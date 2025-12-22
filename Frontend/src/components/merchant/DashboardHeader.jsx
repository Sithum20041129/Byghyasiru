// src/components/merchant/DashboardHeader.jsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Store, CalendarClock } from 'lucide-react';

const DashboardHeader = ({ storeName, onLogout }) => {
  // 1. Calculate Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  // 2. Format Today's Date
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">

      {/* --- Left Side: Store Identity --- */}
      <div className="flex items-center gap-4">
        {/* Gradient Logo Box */}
        <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-orange-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 transform hover:scale-105 transition-transform duration-200">
          <Store className="w-7 h-7 md:w-8 md:h-8 text-white" />
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider mb-0.5">
            <CalendarClock className="w-3 h-3" />
            {today}
          </div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
            {storeName || 'My Store'}
          </h1>
          <p className="text-orange-600 font-medium text-sm">
            {greeting}! 👋
          </p>
        </div>
      </div>

      {/* --- Right Side: Actions --- */}
      <div className="flex items-center justify-end">
        <Button
          variant="ghost"
          onClick={onLogout}
          className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;