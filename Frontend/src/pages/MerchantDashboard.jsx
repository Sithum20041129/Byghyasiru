// src/pages/MerchantDashboard.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from "@/components/merchant/DashboardHeader";
import StatsCards from "@/components/merchant/StatsCards";
import StoreControls from "@/components/merchant/StoreControls";
import OrdersTab from "@/components/merchant/OrdersTab";
import StoreSettings from "./Merchant/StoreSettings";
import MenuPricing from "./Merchant/MenuPricing";
import { ClipboardList, UtensilsCrossed, Settings, Store } from "lucide-react";

const MerchantDashboard = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrdersToday, setCompletedOrdersToday] = useState([]);
  const [completedOrdersThisMonth, setCompletedOrdersThisMonth] = useState([]);
  const [storeSettings, setStoreSettings] = useState({
    is_open: false,
    accepting_orders: false,
    active_meal_time: 'Lunch'
  });

  const [activeTab, setActiveTab] = useState("orders");
  const [loading, setLoading] = useState(true);
  const { user, logout, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'merchant') {
      navigate('/login');
      return;
    }
    loadOrders();
    loadSettings();
  }, [user, authLoading, navigate]);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/merchant/get_settings.php', { credentials: 'include' });
      const data = await res.json();
      if (data.ok) {
        setStoreSettings({
          is_open: data.is_open === 1,
          accepting_orders: data.accepting_orders === 1,
          active_meal_time: data.active_meal_time || 'Lunch'
        });
      }
    } catch (err) {
      console.error("Failed to load settings", err);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/merchant/orders.php', { credentials: 'include' });
      const data = await res.json();
      if (data.ok) {
        setPendingOrders(data.pending || []);
        setActiveOrders(data.active || []);
        setCompletedOrdersToday(data.completedToday || []);
        setCompletedOrdersThisMonth(data.completedThisMonth || []);
      }
    } catch (err) {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/merchant/update_order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ order_id: orderId, status: newStatus })
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: 'Success', description: 'Order updated!' });
        loadOrders();
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to update', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Update failed', variant: 'destructive' });
    }
  };

  const toggleSetting = async (key, value) => {
    setStoreSettings(prev => ({ ...prev, [key]: value }));
    try {
      const res = await fetch('/api/merchant/settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [key]: value })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      toast({ title: 'Success', description: 'Updated successfully' });
    } catch (err) {
      setStoreSettings(prev => ({ ...prev, [key]: !value }));
      toast({ title: 'Error', description: 'Failed to save setting', variant: 'destructive' });
    }
  };

  const updateMealTime = async (value) => {
    setStoreSettings(prev => ({ ...prev, active_meal_time: value }));
    try {
      const res = await fetch('/api/merchant/settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ active_meal_time: value })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      toast({ title: 'Success', description: `Meal time set to ${value}` });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update meal time', variant: 'destructive' });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      toast({ title: 'Error', description: 'Logout failed', variant: 'destructive' });
    }
  };

  const MobileNavItem = ({ value, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={`flex flex-col items-center justify-center w-full py-2 transition-colors duration-200 ${activeTab === value ? "text-orange-600" : "text-gray-500 hover:text-gray-700"
        }`}
    >
      <Icon className={`w-6 h-6 mb-1 ${activeTab === value ? "fill-current" : ""}`} strokeWidth={activeTab === value ? 2.5 : 2} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  if (loading) return <div className="flex justify-center items-center h-screen animate-pulse">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8 font-inter">
      <Helmet>
        <title>Merchant Dashboard - QuickMeal</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4">
        <DashboardHeader storeName={user?.storeName} onLogout={handleLogout} />

        <div className="mt-6">
          <StoreControls
            settings={storeSettings}
            onToggle={toggleSetting}
            onUpdateMealTime={updateMealTime}
          />
        </div>

        {/* Stats only visible on Desktop */}
        <div className="mt-6 mb-8 hidden md:block">
          <StatsCards
            pendingCount={pendingOrders.length}
            activeCount={activeOrders.length}
            completedTodayCount={completedOrdersToday.length}
            completedMonthCount={completedOrdersThisMonth.length}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

            {/* ✅ FIXED: Desktop Tabs are now STICKY */}
            <TabsList className="hidden md:grid w-full grid-cols-3 bg-white/95 backdrop-blur-sm p-1 border rounded-xl shadow-sm sticky top-4 z-50 transition-all">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="menu">Menu & Pricing</TabsTrigger>
              <TabsTrigger value="settings">Store Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="focus:outline-none">
              <OrdersTab
                pendingOrders={pendingOrders}
                activeOrders={activeOrders}
                onUpdateStatus={updateOrderStatus}
              />
            </TabsContent>

            <TabsContent value="menu" className="focus:outline-none">
              <MenuPricing />
            </TabsContent>

            <TabsContent value="settings" className="focus:outline-none">
              <StoreSettings />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Mobile Bottom Navigation (Unchanged) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden z-50 safe-area-pb">
        <div className="flex justify-around items-center px-1">
          <MobileNavItem value="orders" icon={ClipboardList} label="Orders" />
          <MobileNavItem value="menu" icon={UtensilsCrossed} label="Menu" />
          <MobileNavItem value="settings" icon={Store} label="Store" />
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;