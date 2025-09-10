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
import OrdersTab from "@/components/merchant/OrdersTab";
import MenuPricing from "./Merchant/MenuPricing";
import StoreSettings from "./Merchant/StoreSettings";
import { v4 as uuidv4 } from "uuid";

const MerchantDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [storeSettings, setStoreSettings] = useState({
    isOpen: true,
    acceptingOrders: true,
    orderLimit: null,
    closingTime: "",
    universities: [],
    activeMealTime: "Lunch",
    defaultVegCurries: 2,
    vegCurryPrice: 50,
    portionCategories: [
      { id: "small", name: "Small", divisions: 1 },
      { id: "half", name: "Half", divisions: 2 },
      { id: "full", name: "Full", divisions: 3 }
    ],
    mainMeals: [
      {
        id: uuidv4(),
        name: "Rice & Curry",
        portionPrices: { small: 200, half: 250, full: 300 }
      }
    ],
    curries: [
      {
        id: uuidv4(),
        name: "Dhal Curry",
        type: "veg",
        price: 30
      },
      {
        id: uuidv4(),
        name: "Chicken Curry",
        type: "non-veg",
        divisible: true,
        portionPrices: { small: 120, half: 160, full: 200 },
        extraPiecePrice: 40
      }
    ]
  });

  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load orders
  const loadOrders = useCallback(() => {
    if (!user) return;
    const allOrders = JSON.parse(localStorage.getItem("quickmeal_orders") || "[]");
    const storeOrders = allOrders.filter((order) => order.storeId === user.id);
    setOrders(storeOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }, [user]);

  // Load store settings
  const loadStoreSettings = useCallback(() => {
    if (!user) return;
    const settings = JSON.parse(localStorage.getItem("quickmeal_store_settings") || "{}");
    if (settings[user.id]) {
      setStoreSettings((prev) => ({ ...prev, ...settings[user.id] }));
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== "merchant" || !user.approved) {
      navigate("/login");
      return;
    }
    loadOrders();
    loadStoreSettings();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [user, navigate, loadOrders, loadStoreSettings]);

  // Save settings
  const saveStoreSettings = () => {
    const allSettings = JSON.parse(localStorage.getItem("quickmeal_store_settings") || "{}");
    allSettings[user.id] = storeSettings;
    localStorage.setItem("quickmeal_store_settings", JSON.stringify(allSettings));
    toast({ title: "Settings Updated", description: "Your store settings have been saved successfully" });
  };

  // Update order status
  const updateOrderStatus = (orderId, newStatus) => {
    const allOrders = JSON.parse(localStorage.getItem("quickmeal_orders") || "[]");
    const updatedOrders = allOrders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    localStorage.setItem("quickmeal_orders", JSON.stringify(updatedOrders));
    loadOrders();
    toast({ title: "Order Updated", description: `Order status changed to ${newStatus}` });
  };

  // Logout
  const handleLogout = () => {
    logout();
    toast({ title: "Logged out", description: "See you next time!" });
    navigate("/");
  };

  // Order stats
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const activeOrders = orders.filter((o) => o.status === "ready");
  const completedOrdersToday = orders.filter((o) => {
    const d = new Date(o.createdAt), t = new Date();
    return (
      (o.status === "completed" || o.status === "collected") &&
      d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()
    );
  });
  const completedOrdersThisMonth = orders.filter((o) => {
    const d = new Date(o.createdAt), t = new Date();
    return (
      (o.status === "completed" || o.status === "collected") &&
      d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()
    );
  });

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <Helmet>
        <title>Merchant Dashboard - QuickMeal</title>
        <meta name="description" content="Manage your restaurant orders, menu, and store settings on QuickMeal." />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <DashboardHeader storeName={user?.storeName} onLogout={handleLogout} />

        <StatsCards
          pendingCount={pendingOrders.length}
          activeCount={activeOrders.length}
          completedTodayCount={completedOrdersToday.length}
          completedMonthCount={completedOrdersThisMonth.length}
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
                activeOrders={orders.filter((o) => o.status === "completed")}
                onUpdateStatus={updateOrderStatus}
              />
            </TabsContent>

            <TabsContent value="menu">
              <MenuPricing
                storeSettings={storeSettings}
                setStoreSettings={setStoreSettings}
                onSave={saveStoreSettings}
              />
            </TabsContent>

            <TabsContent value="settings">
              <StoreSettings
                settings={storeSettings}
                setSettings={setStoreSettings}
                onSave={saveStoreSettings}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default MerchantDashboard;
