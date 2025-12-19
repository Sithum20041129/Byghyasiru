import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Toaster } from "sonner"; // ✅ use sonner
import { AuthProvider } from "@/contexts/AuthContext";
import CompleteProfile from "./pages/CompleteProfile";

// Pages
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import CustomerDashboard from "@/pages/CustomerDashboard";
import MerchantDashboard from "@/pages/MerchantDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import OrderPage from "@/pages/OrderPage";
import ReceiptPage from "@/pages/ReceiptPage";
import CustomizeMeal from "@/pages/CustomizeMeal";

// Merchant tools
import MenuPricing from "@/pages/Merchant/MenuPricing";
import StoreSettings from "@/pages/Merchant/StoreSettings";

// Routes
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      {/* Dashboards */}
      <Route path="/customer" element={<CustomerDashboard />} />
      <Route path="/merchant" element={<MerchantDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />

      {/* Orders */}
      <Route path="/order/:storeId" element={<OrderPage />} />
      <Route path="/receipt/:orderId" element={<ReceiptPage />} />

      {/* Custom meal builder */}
      <Route path="/customize" element={<CustomizeMeal />} />

      {/* Merchant-specific pages */}
      <Route path="/merchant/menu" element={<MenuPricing />} />
      <Route path="/merchant/settings" element={<StoreSettings />} />

      {/* Redirects for legacy backend URLs */}
      <Route path="/customer/dashboard" element={<Navigate to="/customer" replace />} />
      <Route path="/merchant/dashboard" element={<Navigate to="/merchant" replace />} />
      <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Helmet>
          <title>QuickMeal - Pre-Order Your Meals</title>
          <meta
            name="description"
            content="Skip the queue! Pre-order your favorite meals online and save time at your favorite restaurants."
          />
          <meta
            property="og:title"
            content="QuickMeal - Pre-Order Your Meals"
          />
          <meta
            property="og:description"
            content="Skip the queue! Pre-order your favorite meals online and save time at your favorite restaurants."
          />
        </Helmet>

        <AppRoutes />

        {/* ✅ Sonner toaster (global popup support) */}
        <Toaster richColors position="top-center" />
      </Router>
    </AuthProvider>
  );
}

export default App;
