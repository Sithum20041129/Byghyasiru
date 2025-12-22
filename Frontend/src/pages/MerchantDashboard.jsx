// src/pages/MerchantDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from "@/components/merchant/DashboardHeader";
import StatsCards from "@/components/merchant/StatsCards";
import StoreControls from "@/components/merchant/StoreControls"; // ✅ New Import
import OrdersTab from "@/components/merchant/OrdersTab";
import StoreSettings from "./Merchant/StoreSettings";
import MenuPricing from "./Merchant/MenuPricing";

const MerchantDashboard = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrdersToday, setCompletedOrdersToday] = useState(0);
  const [completedOrdersThisMonth, setCompletedOrdersThisMonth] = useState(0);
  const [storeSettings, setStoreSettings] = useState({
    is_open: false,
    accepting_orders: false,
    active_meal_time: 'Lunch'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { user, logout, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return; // Wait for auth check
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
    setError(false);
    try {
      const res = await fetch('/api/merchant/orders.php', { credentials: 'include' });
      const data = await res.json();
      if (data.ok) {
        setPendingOrders(data.pending || []);
        setActiveOrders(data.active || []);
        setCompletedOrdersToday(data.completedToday || 0);
        setCompletedOrdersThisMonth(data.completedThisMonth || 0);
      } else {
        setError(true);
        toast({ title: 'Error', description: data.error || 'Failed to load orders', variant: 'destructive' });
      }
    } catch (err) {
      setError(true);
      toast({ title: 'Network Error', description: err.message, variant: 'destructive' });
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
    // Optimistic update
    setStoreSettings(prev => ({ ...prev, [key]: value }));

    try {
      const res = await fetch('/api/merchant/settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [key]: value })
      });
      const data = await res.json();

      if (!data.ok) {
        // Revert
        setStoreSettings(prev => ({ ...prev, [key]: !value }));
        toast({ title: 'Error', description: data.error || 'Failed to update setting', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Store status updated' });
      }
    } catch (err) {
      // Revert
      setStoreSettings(prev => ({ ...prev, [key]: !value }));
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
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

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-50 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-bold mb-2">⚠️ Error Loading Dashboard</h2>
        <p className="text-gray-600 mb-4">
          The server sent an invalid response. Please check the backend logs.
        </p>
        <button
          onClick={loadOrders}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <Helmet>
        <title>Merchant Dashboard - QuickMeal</title>
        <meta
          name="description"
          content="Manage your restaurant orders, menu, and store settings on QuickMeal."
        />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <DashboardHeader storeName={user?.storeName} onLogout={handleLogout} />

        {/* ✅ New Store Controls Component */}
        <StoreControls
          storeSettings={storeSettings}
          onToggleSetting={toggleSetting}
        />

        {/* ✅ Streamlined Stats Cards */}
        <StatsCards
          pendingCount={pendingOrders.length}
          activeCount={activeOrders.length}
          completedTodayCount={completedOrdersToday}
          completedMonthCount={completedOrdersThisMonth}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="menu">Menu & Pricing</TabsTrigger>
              <TabsTrigger value="settings">Store Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <OrdersTab
                pendingOrders={pendingOrders}
                activeOrders={activeOrders}
                onUpdateStatus={updateOrderStatus}
              />
            </TabsContent>

            <TabsContent value="menu">
              <MenuPricing />  {/* ← CHANGED HERE: REPLACED AddFoodForm with MenuPricing */}
            </TabsContent>

            <TabsContent value="settings">
              <StoreSettings />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default MerchantDashboard;