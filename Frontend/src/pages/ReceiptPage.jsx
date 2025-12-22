// src/pages/ReceiptPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2, ArrowLeft, CheckCircle2, Receipt, Phone,
  MapPin, Clock, ChefHat, ShoppingBag, QrCode
} from "lucide-react";

// Status Steps Configuration
const STATUS_STEPS = [
  { id: 'pending', label: 'Order Placed', icon: Receipt },
  { id: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { id: 'preparing', label: 'Cooking', icon: ChefHat },
  { id: 'ready', label: 'Ready for Pickup', icon: ShoppingBag },
  { id: 'completed', label: 'Completed', icon: CheckCircle2 },
];

const ReceiptPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Poll for status updates every 15 seconds
  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/get.php?order_id=${orderId}`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 15000); // Auto-refresh
    return () => clearInterval(interval);
  }, [orderId]);

  const getCurrentStepIndex = (status) => {
    const statusMap = {
      'pending': 0,
      'accepted': 1,
      'preparing': 2,
      'ready': 3,
      'completed': 4,
      'picked_up': 4,
      'cancelled': -1
    };
    return statusMap[status] || 0;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
      <p className="text-gray-500 font-medium">Loading your order...</p>
    </div>
  );

  if (!order) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Receipt className="w-8 h-8 text-gray-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900">Order not found</h2>
      <Button onClick={() => navigate('/customer')} variant="link" className="text-orange-600 mt-2">
        Go Home
      </Button>
    </div>
  );

  const currentStep = getCurrentStepIndex(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-gray-50 pb-safe font-inter">

      {/* --- HEADER --- */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate('/customer')} className="-ml-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Button>
        <span className="font-bold text-gray-900 text-sm">Order #{order.id}</span>
        <div className="w-9" /> {/* Spacer */}
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">

        {/* --- 1. LIVE STATUS TRACKER --- */}
        {!isCancelled ? (
          <Card className="border-none shadow-lg bg-white overflow-hidden">
            <div className="h-1.5 bg-gray-100 w-full">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((currentStep + 1) * 25, 100)}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <CardContent className="p-6 pt-8 text-center">
              <div className="mb-6">
                <motion.div
                  key={order.status}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-orange-50 rounded-full text-orange-600 mb-4 ring-8 ring-orange-50/50"
                >
                  {STATUS_STEPS[Math.max(0, currentStep)]?.icon && React.createElement(STATUS_STEPS[Math.max(0, currentStep)].icon, { className: "w-10 h-10" })}
                </motion.div>
                <h1 className="text-2xl font-black text-gray-900 mb-1">
                  {STATUS_STEPS[Math.max(0, currentStep)]?.label}
                </h1>
                <p className="text-gray-500 text-sm">
                  {currentStep === 3 ? "Head to the counter!" : "Estimated time: 10-15 mins"}
                </p>
              </div>

              {/* Status Steps Dots */}
              <div className="flex justify-between items-center px-2 relative">
                {/* Connecting Line */}
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-100 -z-10" />

                {STATUS_STEPS.slice(0, 4).map((step, idx) => {
                  const isActive = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  return (
                    <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-1">
                      <div className={`
                        w-3 h-3 rounded-full transition-colors duration-300
                        ${isActive ? 'bg-green-500 ring-4 ring-white' : 'bg-gray-200'}
                        ${isCurrent ? 'ring-green-100 scale-125' : ''}
                      `} />
                      <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-green-600' : 'text-gray-300'}`}>
                        {step.label.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowLeft className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-red-800">Order Cancelled</h2>
            <p className="text-red-600 text-sm mt-1">This order has been cancelled by the store.</p>
          </div>
        )}

        {/* --- 2. DIGITAL PICKUP PASS --- */}
        <Card className="border-2 border-dashed border-gray-200 bg-[#FFFBF0] relative overflow-hidden">
          <div className="absolute top-1/2 -left-3 w-6 h-6 bg-gray-50 rounded-full" />
          <div className="absolute top-1/2 -right-3 w-6 h-6 bg-gray-50 rounded-full" />

          <CardContent className="p-6 text-center">
            <p className="text-xs text-orange-600 font-bold uppercase tracking-widest mb-2">Pickup Ticket</p>
            <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-1">#{order.id}</h2>
            <p className="text-gray-500 text-sm mb-6">Show this number at the counter</p>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">🏪</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{order.store_name}</h3>
                <p className="text-xs text-gray-500 truncate">{order.store_address || "University Canteen"}</p>
              </div>
              <Button size="icon" variant="outline" className="rounded-full h-10 w-10 shrink-0">
                <Phone className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* --- 3. ORDER SUMMARY --- */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-orange-500" /> Order Details
          </h3>

          <div className="space-y-4">
            {(order.items || []).map((item, i) => (
              <div key={i} className="flex justify-between items-start text-sm">
                <div className="flex items-start gap-3">
                  {item.quantity > 1 && (
                    <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs mt-0.5">
                      {item.quantity}x
                    </span>
                  )}
                  <div>
                    <p className="text-gray-800 font-medium">{item.food_name}</p>
                    {item.portion && <p className="text-xs text-gray-400">{item.portion}</p>}
                  </div>
                </div>
                {/* ✅ PRICE HIDDEN AS REQUESTED */}
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between items-center pt-1">
            <span className="text-gray-500 font-medium">Total Paid</span>
            <span className="text-xl font-black text-gray-900">Rs {Number(order.total_price).toFixed(0)}</span>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 py-4">
          Need help? Contact {order.store_name} support.
        </p>

      </div>
    </div>
  );
};

export default ReceiptPage;