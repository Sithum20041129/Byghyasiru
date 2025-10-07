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
import StoreSettings from "./Merchant/StoreSettings";

/* ---------------------- ADD FOOD FORM ---------------------- */
const AddFoodForm = () => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/merchant/add_food.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: desc, price, category }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        console.error("❌ Invalid JSON from add_food.php:", text);
        setMessage("❌ Server error: Invalid response");
        return;
      }

      if (data.ok) {
        setMessage("✅ Food added successfully!");
        setName("");
        setDesc("");
        setPrice("");
        setCategory("");
      } else {
        setMessage("❌ Error: " + (data.error || "Failed to add food"));
      }
    } catch (err) {
      setMessage("❌ Network error: " + err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 space-y-3 bg-white rounded-xl shadow-md"
    >
      <input
        className="w-full border p-2 rounded"
        placeholder="Food name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        className="w-full border p-2 rounded"
        placeholder="Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <input
        className="w-full border p-2 rounded"
        placeholder="Price"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <input
        className="w-full border p-2 rounded"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-2 rounded"
      >
        Add Food
      </button>
      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
};

/* ---------------------- MAIN DASHBOARD ---------------------- */
const MerchantDashboard = () => {
  const [orders, setOrders] = useState([]);
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [hasError, setHasError] = useState(false);

  // ✅ Load orders from backend
  const loadOrders = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/orders/list.php", {
        credentials: "include", // send cookies/session
      });

      let data;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        console.error("❌ Invalid JSON from list.php:", text);
        setHasError(true);
        return;
      }

      if (data.success) {
        const safeOrders = data.data.map((o) => ({
          ...o,
          customer_name: o.customer_name || "Unknown",
          customer_email: o.customer_email || "N/A",
          created_at: o.created_at || new Date().toISOString(),
          status: o.status || "pending",
        }));
        setOrders(safeOrders);
        setHasError(false);
      } else {
        toast({
          title: "Error loading orders",
          description: data.message || "Unknown error",
        });
      }
    } catch (err) {
      console.error("❌ Network Error:", err);
      toast({
        title: "Network Error",
        description: err.message,
      });
    }
  }, [user, toast]);

  // Auto-refresh orders
  useEffect(() => {
    if (!user || user.role !== "merchant" || !user.approved) {
      navigate("/login");
      return;
    }
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [user, navigate, loadOrders]);

  // ✅ Update order status locally
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    toast({
      title: "Order Updated",
      description: `Order status changed to ${newStatus}`,
    });
  };

  // ✅ Logout
  const handleLogout = () => {
    logout();
    toast({ title: "Logged out", description: "See you next time!" });
    navigate("/");
  };

  // ✅ Stats
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const activeOrders = orders.filter((o) => o.status === "ready");
  const completedOrdersToday = orders.filter((o) => {
    const d = new Date(o.created_at),
      t = new Date();
    return (
      (o.status === "completed" || o.status === "collected") &&
      d.getDate() === t.getDate() &&
      d.getMonth() === t.getMonth() &&
      d.getFullYear() === t.getFullYear()
    );
  });
  const completedOrdersThisMonth = orders.filter((o) => {
    const d = new Date(o.created_at),
      t = new Date();
    return (
      (o.status === "completed" || o.status === "collected") &&
      d.getMonth() === t.getMonth() &&
      d.getFullYear() === t.getFullYear()
    );
  });

  /* ---------------------- RENDER ---------------------- */
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-6 bg-white rounded-xl shadow-md text-center">
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
                activeOrders={activeOrders}
                onUpdateStatus={updateOrderStatus}
              />
            </TabsContent>

            <TabsContent value="menu">
              <AddFoodForm />
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
