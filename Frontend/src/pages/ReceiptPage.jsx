import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, ArrowLeft, CheckCircle2, Receipt, Download, Share2, Store, Clock, MapPin, User, ChevronLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const ReceiptPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const loadOrder = async () => {
      try {
        const res = await fetch(`/api/orders/get.php?order_id=${orderId}`);
        const data = await res.json();

        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          setOrder(null);
        }
      } catch (err) {
        console.error("❌ Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Fetching your receipt...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-500 mb-6">We couldn't find the receipt you're looking for. It might be an invalid ID or the order was removed.</p>
          <Button onClick={() => navigate('/customer')} className="w-full bg-gray-900 hover:bg-gray-800 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] py-8 px-4 flex flex-col items-center justify-center font-inter">

      {/* Back Button */}
      <div className="w-full max-w-md mb-6">
        <Link to="/customer" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden relative">
        {/* Decorative 'Ticket' notches at top */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-red-600"></div>

        <CardHeader className="bg-white pb-6 pt-10 text-center relative">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-extrabold text-gray-900 uppercase tracking-wide">
            Payment Success
          </CardTitle>
          <p className="text-gray-500 text-sm mt-1">Thank you for your order!</p>
        </CardHeader>

        <div className="px-6">
          <div className="border-t-2 border-dashed border-gray-200 my-2"></div>
        </div>

        <CardContent className="bg-white p-6 space-y-6">

          {/* Store Info */}
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-gray-800">{order.store_name}</h3>
            <div className="flex items-center justify-center text-gray-500 text-sm gap-1">
              <MapPin className="w-3 h-3" />
              <span>{order.store_address || 'Campus Store'}</span>
            </div>
          </div>

          {/* Meta Data Grid */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="space-y-1">
              <span className="text-xs text-uppercase text-gray-400 font-semibold tracking-wider">ORDER ID</span>
              <p className="font-mono font-bold text-gray-800">#{order.id}</p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-xs text-uppercase text-gray-400 font-semibold tracking-wider">DATE</span>
              <p className="font-medium text-gray-800 text-sm">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="space-y-1 col-span-2 pt-2 border-t border-gray-200 mt-2">
              <span className="text-xs text-uppercase text-gray-400 font-semibold tracking-wider">CUSTOMER</span>
              <div className="flex items-center gap-2">
                <User className="w-3 h-3 text-gray-400" />
                <span className="font-medium text-gray-800 text-sm truncate">{order.customer_name}</span>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Summary</h4>
            <ul className="space-y-3">
              {(order.items || []).map((item, idx) => (
                <li key={idx} className="flex justify-between items-start text-sm group">
                  <div className="flex items-start">
                    <span className="font-bold text-gray-400 w-6 group-hover:text-orange-500 transition-colors">{item.quantity}x</span>
                    <span className="text-gray-700 font-medium">{item.food_name}</span>
                  </div>
                  <span className="text-gray-900 font-semibold">Rs.{Number(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator className="bg-gray-200" />

          {/* Total */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-bold text-gray-600">Total Amount</span>
            <span className="text-2xl font-extrabold text-gray-900">Rs.{Number(order.total_price).toFixed(2)}</span>
          </div>

        </CardContent>

        {/* Footer Actions */}
        <CardFooter className="bg-gray-50 border-t border-gray-100 p-6 flex flex-col gap-3">
          <Button className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-500/20 transition-all duration-300">
            <Download className="w-5 h-5 mr-2" />
            Download Receipt
          </Button>
          <Button variant="ghost" className="w-full text-gray-500 hover:text-gray-900 hover:bg-gray-200/50">
            <Share2 className="w-4 h-4 mr-2" /> Share Receipt
          </Button>
        </CardFooter>
      </Card>

      {/* Security/Trust footer */}
      <div className="mt-8 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
        <Clock className="w-3 h-3" />
        <span>Processed securely by QuickMeal</span>
      </div>
    </div>
  );
};

export default ReceiptPage;
